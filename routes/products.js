const { Product } = require("../models/product");
const { Category } = require("../models/category");
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");

const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("invalid image type");
    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, "public/upload");
  },
  filename: function (req, file, cb) {
    //  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const fileName = file.originalname.split(" ").join("-");
    const extension = FILE_TYPE_MAP[file.mimetype];
    //FILE_TYPE_MAP[file.mimetype]=png
    //file.mimetype=image/png
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

const uploadOptions = multer({ storage: storage });

router.get(`/`, async (req, res) => {
  let filter = {};
  if (req.query.categories) {
    filter = { category: req.query.categories.split(",") };
  }
  const productList = await Product.find(filter);

  if (!productList) {
    return res.status(500).json({ message: "Cant find product" });
  }
  res.status(200).send(productList);
});

router.get(`/:id`, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send("Invalid Id");
  }
  const product = await Product.findById(req.params.id).populate("category");

  if (!product) {
    return res.status(500).json({ message: "Cant find product" });
  }
  res.status(200).send(product);
});

router.post("/", uploadOptions.single("image"), async (req, res) => {
  const category = await Category.findById(req.body.category);
  const file = req.file;
  if (!category) return res.status(400).send("Invalid Category");
  if (!file) return res.status(400).send("Invalid File");

  const fileName = req.file.filename; //image-2323232
  const basePath = `${req.protocol}://${req.get("host")}/public/upload/`; //http://localhost:300/public/upload/
  let product = new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: `${basePath}${fileName}`, //http://localhost:300/public/upload/image-2323232
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured,
  });

  product = await product.save();

  if (!product) return res.status(500).send("The product cannot be created");

  res.send(product);
});
router.put(`/:id`, uploadOptions.single("image"), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send("Invalid Id");
  }
  const category = await Category.findById(req.body.category);
  const product = await Product.findById(req.params.id);

  if (!category) return res.status(400).send("Invalid Category");
  if (!product) return res.status(400).send("Invalid Product");
  const file = req.file;
  let imagePath;
  if (file) {
    const fileName = req.file.filename; //image-2323232
    const basePath = `${req.protocol}://${req.get("host")}/public/upload/`;
    imagePath = `${basePath}${fileName}`;
  } else {
    imagePath = product.image;
  }
  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: req.body.image,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    },
    { new: true }
  );

  if (!updatedProduct)
    return res.status(400).send("the category cannot be created!");

  res.send(updatedProduct);
});

router.delete(`/:id`, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send("Invalid Id");
  }
  Product.findByIdAndRemove(req.params.id)
    .then((product) => {
      if (product) {
        return res
          .status(200)
          .json({ success: true, message: "the product is deleted!" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "product not found!" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ success: false, error: err });
    });
});

router.get(`/get/count`, async (req, res) => {
  let count;
  const productCount = await Product.countDocuments({ count: count });

  if (!productCount) {
    return res
      .status(404)
      .json({ success: true, message: "the product not found" });
  }
  res.send({ count: productCount });
});
router.get(`/get/feature/:count`, async (req, res) => {
  const limit = req.params.count ? req.params.count : 0;
  const featuredproduct = await Product.find({ isFeatured: true }).limit(
    +limit
  );

  if (!featuredproduct) {
    return res
      .status(404)
      .json({ success: true, message: "the product not found" });
  }
  res.send(featuredproduct);
});

module.exports = router;
