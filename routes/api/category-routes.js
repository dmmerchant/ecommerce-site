const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/categories` endpoint

router.get('/',  async (req, res) => {
  // find all categories
  // be sure to include its associated Products
  try {
    const dbCategoryData = await Category.findAll({
      include: [
        {
          model: Product,
          include: [{
            model: Tag, through: ProductTag, as: 'product_tags' 
          }]
        }
      ],
    });
    res.status(200).json(dbCategoryData);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

router.get('/:id',  async (req, res) => {
  // find one category by its `id` value
  // be sure to include its associated Products
  try {
    const dbCategoryData = await Category.findByPk(req.params.id, {
      include: [{ model: Product}]
    });

    if (!dbCategoryData) {
      res.status(404).json({ message: 'No category found with this id!' });
      return;
    }

    res.status(200).json(dbCategoryData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post('/',  async (req, res) => {
  // create a new category
  try {
    const dbCategoryData = await Category.create(req.body);
    res.status(200).json(dbCategoryData);
  } catch (err) {
    res.status(400).json(err);
  }
});

router.put('/:id',  async (req, res) => {
  // update a category by its `id` value
  // Calls the update method on the Book model
  try {
    const dbCategoryData = await Category.update(
      {
        category_name: req.body.category_name
      },
      {
        where: {
          id: req.params.id,
        },
      }
    );
    res.status(200).json(dbCategoryData);
  } catch (err) {
    res.status(400).json(err);
  }
});

router.delete('/:id',  async (req, res) => {
  // delete a category by its `id` value
  try {
    const dbCategoryData = await Category.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json(dbCategoryData);
  } catch (err) {
    res.status(400).json(err);
  }
});

module.exports = router;
