const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite'
});

const Item = sequelize.define('Item', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING
  },
  featureImage: {
    type: DataTypes.STRING
  },
  published: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  postDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  body: {
    type: DataTypes.TEXT
  }
});


module.exports = { sequelize, Item };
