import mongoose from 'mongoose'
import { config } from 'dotenv'
config()
import colors from 'colors'
import users from './data/users.js'
import episodes from './data/episodes.js'
import User from './models/userModel.js'
import Episode from './models/episodeModel.js'
import Order from './models/orderModel.js'
import connectDB from './config/db.js'

connectDB()

const importData = async () => {
  try {
    await Order.deleteMany()
    await Episode.deleteMany()
    await User.deleteMany()

    const createdUsers = await User.insertMany(users)

    const adminUser = createdUsers[0]._id

    const sampleEpisodes = episodes.map(episode => {
      return { ...episode, user: adminUser }
    })

    await Episode.insertMany(sampleEpisodes)

    console.log('Data Imported'.green.inverse)
  } catch (error) {
    console.error(`${error}`.red.inverse)
    process.exit(1) 
  }
} 


const destroyData = async () => {
  try {
    await Order.deleteMany()
    await Episode.deleteMany()
    await User.deleteMany()

    console.log('Data Destroyed'.red.inverse)
  } catch (error) {
    console.error(`${error}`.red.inverse)
    process.exit(1) 
  }
} 

if (process.argv[2] === '-d') {
  destroyData()
} else {
  importData()
}
