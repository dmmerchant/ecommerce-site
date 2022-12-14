const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  // find all products
  // be sure to include its associated Category and Tag data
  try {
    const productData = await Product.findAll({
      include: [
        {
          model: Category
        },
        {
          model: Tag, through: ProductTag, as: 'product_tags'
        }
      ],
    });

    if (!productData) {
      res.status(404).json({ message: 'No products found!' });
      return;
    }

    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// get one product
router.get('/:id', async (req, res) => {
  // find a single product by its `id`
  // be sure to include its associated Category and Tag data
  try {
    const productData = await Product.findByPk(req.params.id, {
      include: [
        {
          model: Category
        },
        {
          model: Tag, through: ProductTag, as: 'product_tags'
        }
      ],
    });

    if (!productData) {
      res.status(404).json({ message: 'No products found with this id!' });
      return;
    }

    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// create new product
router.post('/', async (req, res) => {
  /* req.body should look like this...
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      tagIds: [1, 2, 3, 4]
    }
  */
  try {
    const product = await Product.create(req.body)
    // if there's product tags, we need to create pairings to bulk create in the ProductTag model
    if (req.body.tagIds.length) {
      const productTagIdArr = req.body.tagIds.map((tag_id) => {
        return {
          product_id: product.id,
          tag_id,
        };
      });
      const productTagIds = await ProductTag.bulkCreate(productTagIdArr);
      res.status(200).json(productTagIds)
    }
    // if no product tags, just respond
    res.status(200).json(product);
  }
  catch {
    (err) => {
      console.log(err);
      res.status(400).json(err);
    }
  }
});

// update product
router.put('/:id', async (req, res) => {

  try {
    // update product data
    console.log("update product data")
    const product = await Product.update(req.body, {
      where: {
        id: req.params.id,
      },
    })

    // find all associated tags from ProductTag
    console.log("find all associated tags from ProductTag ")
    const productTags = await ProductTag.findAll({ where: { product_id: req.params.id } });

    // get list of current tag_ids
    console.log('get list of current tag_ids')
    const productTagIds = productTags.map(({ tag_id }) => tag_id);

    // create filtered list of new tag_ids
    console.log('create filtered list of new tag_ids')
    console.log(typeof(req.body.tagIds))
    if (req.body.tagIds !== undefined) {
      console.log("YO, you didn't stop")
      const newProductTags = req.body.tagIds
        .filter((tag_id) => !productTagIds.includes(tag_id))
        .map((tag_id) => {
          return {
            product_id: req.params.id,
            tag_id,
          };
        });
      // figure out which ones to remove
      console.log('figure out which ones to remove')
      const productTagsToRemove = productTags
        .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
        .map(({ id }) => id);


      // run both actions
      console.log("run both actions")
      const updatedProductTags = await Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove } }),
        ProductTag.bulkCreate(newProductTags)
      ]);
      res.json({productUpdates:product,tagUpdates: updatedProductTags})
    }
    console.log("huh?")
    res.json(product)
  }
  catch {
    (err) => {
      // console.log(err);
      res.status(400).json(err);
    }
  }
});

router.delete('/:id', async (req, res) => {
  // delete one product by its `id` value
  try {
    const productData = await Product.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json(productData);
  } catch (err) {
    res.status(400).json(err);
  }
});

module.exports = router;





