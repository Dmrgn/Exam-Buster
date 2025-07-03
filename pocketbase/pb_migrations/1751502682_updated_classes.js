/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2478702895")

  // add field
  collection.fields.addAt(4, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text2909181811",
    "max": 0,
    "min": 0,
    "name": "textbook_status",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
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

  // add field
  collection.fields.addAt(6, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text3716594886",
    "max": 0,
    "min": 0,
    "name": "textbook_job_id",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2478702895")

  // remove field
  collection.fields.removeById("text2909181811")

  // remove field
  collection.fields.removeById("file2503251663")

  // remove field
  collection.fields.removeById("text3716594886")

  return app.save(collection)
})
