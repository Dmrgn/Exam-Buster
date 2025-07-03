/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2137512776")

  // add field
  collection.fields.addAt(4, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_2478702895",
    "hidden": false,
    "id": "relation3088027820",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "classId",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2137512776")

  // remove field
  collection.fields.removeById("relation3088027820")

  return app.save(collection)
})
