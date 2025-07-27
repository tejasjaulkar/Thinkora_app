import React from 'react'
import { useParams } from 'react-router'
import { useState } from 'react';
import { categories } from '../services/apis';
import { apiConnector } from '../services/apiConnector';
import { useEffect } from 'react';
import CourseSlider from '../Components/core/Catalog/CourseSlider';
import { getCatalogaPageData } from '../services/operations/pageAndComponentData';
import CatalogCard from '../Components/core/Catalog/CatalogCard';
import { useDispatch } from 'react-redux';

const Catalog = () => {

  const Catalog = useParams();
  const [Desc, setDesc] = useState([]);
  const [CatalogPageData, setCatalogPageData] = useState(null);
  const [categoryID, setcategoryID] = useState(null);
  const [activeOption, setActiveOption] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();


  const fetchSublinks=  async ()=>{
    try {
        const result = await apiConnector("GET",categories.CATEGORIES_API);
        const category_id= result.data.data.filter((item)=>item.name=== Catalog.catalog)[0]._id;
        setcategoryID(category_id);      
        setDesc(result.data.data.filter((item)=>item.name=== Catalog.catalog)[0]);
        // console.log("Desc",Desc);  
        // console.log(category_id);
    } catch (error) {
        console.log("could not fetch sublinks");
        console.log(error);
        setError("Category not found");
        setLoading(false);
    }
}
useEffect(() => {
    fetchSublinks();
}, [Catalog])

useEffect(() => {
    const fetchCatalogPageData = async () => {
        setLoading(true);
        try {
            const result = await getCatalogaPageData(categoryID,dispatch);
            setCatalogPageData(result);
            setLoading(false);
            // console.log("page data",CatalogPageData);
        } catch (error) {
            console.log("Error fetching catalog data:", error);
            setError("Failed to load courses");
            setLoading(false);
        }
    }
    if (categoryID) {
        fetchCatalogPageData();
    }
}, [categoryID])


  return (
    <div>
      <div className=' box-content bg-richblack-800 px-4'>
      <div className='mx-auto flex min-h-[260px]  flex-col justify-center gap-4 '>
        <p className='text-sm text-richblack-300'>Home / Catalog / <span className='text-yellow-25'>{Catalog.catalog}</span> </p>
        <p className='text-3xl text-richblack-5'>{Catalog?.catalog}</p>
        <p className='max-w-[870px] text-richblack-200'>
          {Desc?.description}
        </p>
      </div>
      </div>

      {loading ? (
        <div className='mx-auto box-content w-full max-w-maxContentTab px-2 py-12 lg:max-w-maxContent'>
          <div className='flex items-center justify-center min-h-[200px]'>
            <div className='text-richblack-5 text-lg'>Loading courses...</div>
          </div>
        </div>
      ) : error ? (
        <div className='mx-auto box-content w-full max-w-maxContentTab px-2 py-12 lg:max-w-maxContent'>
          <div className='flex items-center justify-center min-h-[200px]'>
            <div className='text-pink-200 text-lg'>{error}</div>
          </div>
        </div>
      ) : (
        <>
          <div className=' mx-auto box-content w-full max-w-maxContentTab px-2 py-12 lg:max-w-maxContent'>
            <h2 className='Courses to get you started'>
            Courses to get you started
            </h2>
            <div className='my-4 flex border-b border-b-richblack-600 text-sm'>
              <button onClick={()=>{setActiveOption(1)}}  className={activeOption===1? `px-4 py-2 border-b border-b-yellow-25 text-yellow-25 cursor-pointer`:`px-4 py-2 text-richblack-50 cursor-pointer` }>Most Populer</button>
              <button onClick={()=>{setActiveOption(2)}} className={activeOption===1?'px-4 py-2 text-richblack-50 cursor-pointer':'px-4 py-2 border-b border-b-yellow-25 text-yellow-25 cursor-pointer'}>New</button>
            </div>
            {CatalogPageData?.selectedCourses?.length > 0 ? (
              <CourseSlider Courses={CatalogPageData?.selectedCourses}/>
            ) : (
              <div className='text-center py-8 text-richblack-300'>
                No courses available in this category yet.
              </div>
            )}        
          </div>

          <div className=' mx-auto box-content w-full max-w-maxContentTab px-4 py-12 lg:max-w-maxContent'>
            <h2 className='section_heading mb-6 md:text-3xl text-xl'>
              Similar to {Catalog.catalog}
            </h2>
            {CatalogPageData?.differentCourses?.length > 0 ? (
              <CourseSlider Courses={CatalogPageData?.differentCourses}/>
            ) : (
              <div className='text-center py-8 text-richblack-300'>
                No similar courses available.
              </div>
            )}
          </div>
          
          <div className=' mx-auto box-content w-full max-w-maxContentTab px-2 py-12 lg:max-w-maxContent'>
            <h2 className='section_heading mb-6 md:text-3xl text-xl'>
              Frequently BoughtTogether
              </h2>
              <div className='grid grid-cols-2 gap-3 lg:gap-6 lg:grid-cols-2 pr-4'>
                {
                  CatalogPageData?.mostSellingCourses?.map((item,index)=>(
                    <CatalogCard key={index} course={item} Height={"h-[100px] lg:h-[400px]"} />
                  ))
                }
              </div>
          </div>
        </>
      )}

    </div>
  )
}

export default Catalog