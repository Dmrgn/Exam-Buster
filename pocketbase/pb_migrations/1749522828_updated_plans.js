/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4263585338")

  // update field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "json1455634619",
    "maxSize": 0,
    "name": "limits",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4263585338")

  // update field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "json1455634619",
    "maxSize": 0,
    "name": "usage",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
})
