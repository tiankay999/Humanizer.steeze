const Datatypes= require("sequelize").DataTypes;
const sequelize= require("../config/database");

const Text = sequelize.define("Text", {
    id: {
        type: Datatypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    text: {
        type: Datatypes.TEXT,
        allowNull: false
    },
    humanizedText: {
        type: Datatypes.TEXT,
        allowNull: false
    }
});

module.exports = Text;