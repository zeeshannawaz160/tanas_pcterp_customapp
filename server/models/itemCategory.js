const mongoose = require('mongoose');
const autoIncrement = require("mongoose-auto-increment");
const castObjectId = mongoose.ObjectId.cast();
mongoose.ObjectId.cast(v => v === '' || v === 'Select...' ? v : castObjectId(v));

const itemCategorySchema = mongoose.Schema({
    name: String,
    schemaId: String,
    parent: [mongoose.Schema.Types.ObjectId]
},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        timestamps: true
    }
)

itemCategorySchema.plugin(autoIncrement.plugin, {
    model: "ItemCategory",
    field: "itemCategoryId",
});

const ItemCategoryModel = mongoose.model('ItemCategory', itemCategorySchema);

module.exports = ItemCategoryModel;
