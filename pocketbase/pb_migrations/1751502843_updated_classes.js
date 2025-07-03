/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2478702895")

  // update field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "file2503251663",
    "maxSelect": 1,
    "maxSize": 40,
    "mimeTypes": [],
    "name": "textbook",
    "presentable": false,
    "protected": false,
    "required": false,
    "system": false,
    "thumbs": [],
    "type": "file"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2478702895")

  // update field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "file2503251663",
    "maxSelect": 1,
    "maxSize": 0,
    "mimeTypes": [],
    "name": "textbook",
    "presentable": false,
    "protected": false,
    "required": false,
    "system": false,
    "thumbs": [],
    "type": "file"
  }))

  return app.save(collection)
})
