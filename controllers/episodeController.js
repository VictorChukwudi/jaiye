import asyncHandler from 'express-async-handler'
import Episode from '../models/episodeModel.js'

// @desc    Fetch all episodes
// @route   GET /api/episodes
// @access  Public
const getEpisodes = asyncHandler(async (req, res) => {
  const pageSize = 10
  const page = Number(req.query.pageNumber) || 1

  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: 'i',
        },
      }
    : {}

  const count = await Episode.countDocuments({ ...keyword })
  const episodes = await Episode.find({ ...keyword })
    .limit(pageSize)
    .skip(pageSize * (page - 1))

  res.json({ episodes, page, pages: Math.ceil(count / pageSize) })
})

// @desc    Fetch single episode
// @route   GET /api/episodes/:id
// @access  Public
const getEpisodeById = asyncHandler(async (req, res) => {
  const episode = await Episode.findById(req.params.id)

  if (episode) {
    res.json(episode)
  } else {
    res.status(404)
    throw new Error('Event not found')
  }
})

// @desc    Delete a episode
// @route   DELETE /api/episodes/:id
// @access  Private/Admin
const deleteEpisode = asyncHandler(async (req, res) => {
  const episode = await Episode.findById(req.params.id)

  if (episode) {
    await episode.remove()
    res.json({ message: 'Event removed' })
  } else {
    res.status(404)
    throw new Error('Event not found')
  }
})

// @desc    Create a episode
// @route   POST /api/episodes
// @access  Private/Admin
const createEpisode = asyncHandler(async (req, res) => {
  const episode = new Episode({
    name: 'Sample name',
    price: 0,
    user: req.user._id,
    image: '/images/sample.jpg',
    brand: 'Sample brand',
    category: 'Sample category',
    countInStock: 0,
    numReviews: 0,
    description: 'Sample description',
  })

  const createdEpisode = await episode.save()
  res.status(201).json(createdEpisode)
})

// @desc    Update a episode
// @route   PUT /api/episodes/:id
// @access  Private/Admin
const updateEpisode = asyncHandler(async (req, res) => {
  const {
    name,
    price,
    description,
    image,
    brand,
    category,
    countInStock,
  } = req.body

  const episode = await Episode.findById(req.params.id)

  if (episode) {
    episode.name = name
    episode.price = price
    episode.description = description
    episode.image = image
    episode.brand = brand
    episode.category = category
    episode.countInStock = countInStock

    const updatedEpisode = await episode.save()
    res.json(updatedEpisode)
  } else {
    res.status(404)
    throw new Error('Event not found')
  }
})

// @desc    Create new review
// @route   POST /api/episodes/:id/reviews
// @access  Private
const createEpisodeReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body

  const episode = await Episode.findById(req.params.id)

  if (episode) {
    const alreadyReviewed = episode.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    )

    if (alreadyReviewed) {
      res.status(400)
      throw new Error('Event already reviewed')
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    }

    episode.reviews.push(review)

    episode.numReviews = episode.reviews.length

    episode.rating =
      episode.reviews.reduce((acc, item) => item.rating + acc, 0) /
      episode.reviews.length

    await episode.save()
    res.status(201).json({ message: 'Review added' })
  } else {
    res.status(404)
    throw new Error('Event not found')
  }
})

// @desc    Get top rated episodes
// @route   GET /api/episodes/top
// @access  Public
const getTopEpisodes = asyncHandler(async (req, res) => {
  const episodes = await Episode.find({}).sort({ rating: -1 }).limit(3)

  res.json(episodes)
})

export {
  getEpisodes,
  getEpisodeById,
  deleteEpisode,
  createEpisode,
  updateEpisode,
  createEpisodeReview,
  getTopEpisodes,
}