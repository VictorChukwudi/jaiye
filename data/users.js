import bcrypt from 'bcryptjs'

const users = [
    {
        name: 'Admin User',
        email: 'admin@example.com',
        password: bcrypt.hashSync('123456', 10),
        isAdmin: true
    },
    {
        name: 'Victor',
        email: 'victor@example.com',
        password: bcrypt.hashSync('123456', 10),
    },
    {
        name: 'Saint Favour',
        email: 'saint@example.com',
        password: bcrypt.hashSync('123456', 10),
    },
]

export default users