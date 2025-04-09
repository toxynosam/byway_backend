const mongoose = require("mongoose");

// lectures
const lectureSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  videoUrl: {
    type: String,
  },
  duration: {
    type: Number,
  },
  isPreview: {
    type: Boolean,
    default: false,
  },
  resources: [
    {
      name: String,
      fileUrl: String,
      fileType: String,
    },
  ],
});

//schema for courses sections
const sectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  order: {
    type: Number,
    required: true,
  },
  lectures: [lectureSchema],
});

//main course schema
const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced", "All Levels"],
      default: "All Levels",
    },
    // check for errors with regards to the brackets ------>>>>******
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subcategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    previewImage: {
      type: String,
      required: true,
    },
    previewVideo: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    originalPrice: {
      type: Number,
    },
    discount: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    sections: [sectionSchema],
    totalLectures: {
      type: Number,
      default: 0,
    },
    totalHours: {
      type: Number,
      default: 0,
      get: (v) => parseFloat(v.toFixed(1)), // format the value to one decimal place although anticipating a float
    },
    languages: [
      {
        type: String,
      },
    ],
    requirements: [String],
    learningOutcomes: [String],
    ratings: {
      average: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    status: {
      type: String,
      enum: ["Draft", "Published", "Archived"],
      default: "Draft",
    },
    enrolledStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true },
  }
);