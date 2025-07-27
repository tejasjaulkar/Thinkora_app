import { apiConnector } from "../apiConnector";
import { studentEndpoints } from "../apis";
import { toast } from "react-hot-toast";
import rzplogo from "../../assets/Images/rzp.png";
import { resetCart } from "../../slices/cartSlice";




const { COURSE_PAYMENT_API, COURSE_VERIFY_API, SEND_PAYMENT_SUCCESS_EMAIL_API } = studentEndpoints;




function loadScript (src) {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
}


export async function buyCourse (token, courses, userDetails, navigate, dispatch) {
    // console.log("buyCourse -> courses",process.env.REACT_APP_BASE_URL)
    const toastId = toast.loading("Please wait while we redirect you to payment gateway", {
      position: "bottom-center",
      autoClose: false,
    });
    try {
    const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
    if (!res) {
        toast.error("Razorpay SDK failed to load. Are you online?");
        return;
        }
    
    // Ensure token is properly formatted
    const cleanToken = typeof token === 'string' ? token.replace(/"/g, '') : token;
    
    const orderResponse = await apiConnector("POST", COURSE_PAYMENT_API, {courses},{
        Authorisation: `Bearer ${cleanToken}`,
    })
    if(!orderResponse.data.success){
        // Check if payment gateway is disabled
        if (orderResponse.data.message && orderResponse.data.message.includes('disabled')) {
            toast.error("Payment gateway is temporarily disabled. Please contact support.");
        } else {
            toast.error(orderResponse.data.message);
        }
        console.log("buyCourse -> orderResponse", orderResponse)
        toast.dismiss(toastId);
        return
    }
    console.log("buyCourse -> orderResponse", orderResponse)
    
    const options = {
        key: "rzp_test_4CqyllvIyVSFiQ", // REPLACE THIS WITH YOUR ACTUAL KEY ID
        currency: orderResponse.data.currency,
        amount: orderResponse.data.amount.toString(),
        order_id: orderResponse.data.orderId,
        name: "Thinkora",
        description: "Thank you for purchasing the course",
        image: rzplogo,
        prefill: {
            name: userDetails?.firstName + " " + userDetails?.lastName,
            email: userDetails?.email,
        },
        handler: async function (response) {
            console.log("Payment successful! Response:", response)
            sendPaymentSuccessEmail(response,orderResponse.data.amount,token);
            verifypament(response,courses,token,navigate,dispatch);
        },
        theme: {
            color: "#686CFD",
        },
    };
    console.log("Razorpay options:", options);
    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
    paymentObject.on("payment.failed", function (response) {
        console.log("Payment failed:", response);
        toast.error("Payment Failed");
    });
    toast.dismiss(toastId);

    } catch (error) {
        toast.dismiss(toastId);
        toast.error("Something went wrong");
        console.log("buyCourse -> error", error)
    }
}



async function sendPaymentSuccessEmail (response,amount,token) {
    // const data = {
    //     amount,
    //     paymentId: response.razorpay_payment_id,
    //     orderId: response.razorpay_order_id,
    //     signature: response.razorpay_signature,
    // };
    const res = await apiConnector("POST", SEND_PAYMENT_SUCCESS_EMAIL_API,{
        amount,
        paymentId:response.razorpay_payment_id,
        orderId:response.razorpay_order_id,
    }, {
        Authorization: `Bearer ${token}`,
    });
    if (!res.success) {
        console.log(res.message);
        toast.error(res.message);
    }
}

async function verifypament (response,courses,token,navigate,dispatch,) {
    const toastId = toast.loading("Please wait while we verify your payment");
    console.log("verifypayment -> courses", courses.courses);
    try{
        // Ensure token is properly formatted
        const cleanToken = typeof token === 'string' ? token.replace(/"/g, '') : token;
        
        const res = await apiConnector("POST", COURSE_VERIFY_API,{
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            courses:courses.courses || courses,
        }, {
            Authorisation: `Bearer ${cleanToken}`,
        });
        console.log("verifypament -> res", res)
        if (!res.data.success) {
            // Check if payment gateway is disabled
            if (res.data.message && res.data.message.includes('disabled')) {
                toast.error("Payment gateway is temporarily disabled. Please contact support.");
            } else {
                toast.error(res.message);
            }
            return;
        }

        toast.success("Payment Successfull");
        navigate("/dashboard/enrolled-courses");
        dispatch(resetCart());
    }
    catch(err){
        toast.error("Payment Failed");
        console.log(err);
    }
    toast.dismiss(toastId);
}


