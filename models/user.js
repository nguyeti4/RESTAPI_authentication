const { DataTypes } = require('sequelize')

const sequelize = require('../lib/sequelize')

const bcrypt = require('bcryptjs')

const User = sequelize.define('user', {
  id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true},
  password: {
      type: DataTypes.STRING, allowNull: false,
      set(value){
          this.setDataValue('password', bcrypt.hashSync(value,8))
      }
  },
  admin: { type: DataTypes.BOOLEAN, allowNull: false}
})

exports.User = User

/*
 * Export an array containing the names of fields the client is allowed to set
 * on businesses.
 */
exports.UserFields = [
  'id',
  'name',
  'email',
  'password',
  'admin'
]