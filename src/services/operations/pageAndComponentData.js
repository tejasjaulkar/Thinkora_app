import {toast} from "react-hot-toast"
import { setProgress } from "../../slices/loadingBarSlice";
import { apiConnector } from '../apiConnector';
import { catalogData } from '../apis';

export const getCatalogaPageData = async(categoryId,dispatch) => {
  // const toastId = toast.loading("Loading...");
  dispatch(setProgress(50));
  let result = [];
  try{
        const response = await apiConnector("POST", catalogData.CATALOGPAGEDATA_API, 
        {categoryId: categoryId,});
        console.log("CATALOG PAGE DATA API RESPONSE....", response);
        if(!response.data.success)
            throw new Error("Could not Fetch Category page data error",
            response);

         result = response?.data;

  }
  catch(error) {
    console.log("CATALOG PAGE DATA API ERROR....", error);
    // Don't show error toast for empty categories
    if (error.response?.status !== 404) {
      toast.error("Failed to load category data");
    }
    result = error.response?.data;
  }
  // toast.dismiss(toastId);
  dispatch(setProgress(100));
  return result;
}

