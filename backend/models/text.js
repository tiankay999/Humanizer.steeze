const Datatypes = require("sequelize").DataTypes;
const sequelize = require("../config/database");

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
    },
    tone: {
        type: Datatypes.STRING,
        allowNull: false,
        defaultValue: "Neutral"
    },
    userId: {
        type: Datatypes.INTEGER,
        allowNull: false
    }
});

module.exports = Text;