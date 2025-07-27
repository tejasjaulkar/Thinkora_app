const Category = require("../models/Category");
const Course = require("../models/Course");

exports.createCategory = async (req, res) => {
	try {
		const { name, description } = req.body;
		if (!name) {
			return res
				.status(400)
				.json({ success: false, message: "All fields are required" });
		}
		const CategorysDetails = await Category.create({
			name: name,
			description: description,
		});
		console.log(CategorysDetails);
		return res.status(200).json({
			success: true,
			message: "Categorys Created Successfully",
		});
	} catch (error) {
		return res.status(500).json({
			success: true,
			message: error.message,
		});
	}
};

exports.showAllCategories = async (req, res) => {
	try {
		const allCategorys = await Category.find(
			{},
			{ name: true, description: true }
		);
		res.status(200).json({
			success: true,
			data: allCategorys,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

exports.categoryPageDetails = async (req, res) => {
	try {
		const { categoryId } = req.body;

		// Get courses for the specified category
		const selectedCategory = await Category.findById(categoryId)
			.populate({
				path: "courses",
				match: { status: "Published" },
				populate: [
					{ path: "instructor" },
					{ path: "ratingAndReviews" }
				]
			})
			.exec();

		// Handle the case when the category is not found
		if (!selectedCategory) {
			console.log("Category not found.");
			return res
				.status(404)
				.json({ success: false, message: "Category not found" });
		}

		const selectedCourses = selectedCategory.courses || [];

		// Get courses for other categories
		const categoriesExceptSelected = await Category.find({
			_id: { $ne: categoryId },
		}).populate({
			path: "courses",
			match: { status: "Published" },
			populate: [
				{ path: "instructor" },
				{ path: "ratingAndReviews" }
			]
		});
		
		let differentCourses = [];
		for (const category of categoriesExceptSelected) {
			if (category.courses && category.courses.length > 0) {
				differentCourses.push(...category.courses);
			}
		}

		// Get top-selling courses across all categories
		const allCategories = await Category.find().populate({
			path: "courses",
			match: { status: "Published" },
			populate: [
				{ path: "instructor" },
				{ path: "ratingAndReviews" }
			]
		});
		
		const allCourses = allCategories.flatMap((category) => category.courses || []);
		// Sort by students enrolled instead of sold field
		const mostSellingCourses = allCourses
			.sort((a, b) => (b.studentsEnrolled?.length || 0) - (a.studentsEnrolled?.length || 0))
			.slice(0, 10);

		res.status(200).json({
			selectedCourses: selectedCourses,
			differentCourses: differentCourses,
			mostSellingCourses: mostSellingCourses,
			success: true,
		});
	} catch (error) {
		console.error("Category page details error:", error);
		return res.status(500).json({
			success: false,
			message: "Internal server error",
			error: error.message,
		});
	}
};

//add course to category
exports.addCourseToCategory = async (req, res) => {
	const { courseId, categoryId } = req.body;
	// console.log("category id", categoryId);
	try {
		const category = await Category.findById(categoryId);
		if (!category) {
			return res.status(404).json({
				success: false,
				message: "Category not found",
			});
		}
		const course = await Course.findById(courseId);
		if (!course) {
			return res.status(404).json({
				success: false,
				message: "Course not found",
			});
		}
		if(category.courses.includes(courseId)){
			return res.status(200).json({
				success: true,
				message: "Course already exists in the category",
			});
		}
		category.courses.push(courseId);
		await category.save();
		return res.status(200).json({
			success: true,
			message: "Course added to category successfully",
		});
	}
	catch (error) {
		return res.status(500).json({
			success: false,
			message: "Internal server error",
			error: error.message,
		});
	}
}

// Function to create default categories
const createDefaultCategories = async () => {
	try {
		const existingCategories = await Category.find({});
		if (existingCategories.length === 0) {
			const defaultCategories = [
				{
					name: "Web Development",
					description: "Learn to build modern web applications using various technologies and frameworks."
				},
				{
					name: "Mobile Development",
					description: "Master mobile app development for iOS and Android platforms."
				},
				{
					name: "Data Science",
					description: "Explore data analysis, machine learning, and artificial intelligence."
				},
				{
					name: "Design",
					description: "Learn UI/UX design, graphic design, and creative skills."
				},
				{
					name: "Business",
					description: "Develop business skills, entrepreneurship, and management expertise."
				},
				{
					name: "Marketing",
					description: "Master digital marketing, SEO, and growth strategies."
				},
				{
					name: "Programming",
					description: "Learn programming fundamentals and various programming languages."
				},
				{
					name: "Photography",
					description: "Develop photography skills and creative visual storytelling."
				}
			];

			await Category.insertMany(defaultCategories);
			console.log("Default categories created successfully!");
		}
	} catch (error) {
		console.error("Error creating default categories:", error);
	}
};

// Call this function when the server starts
createDefaultCategories();