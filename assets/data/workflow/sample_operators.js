export const operatorList = {
  "DataSource": [
    {
      "operatorName": "REST",
      "attributes": {
        "operator_type": {
          "type": "string",
          "hidden": true,
          "value": "restOperator.{METHOD}"
        },
        "task_id": {
          "type": "string",
          "hidden": false
        },
        "method": {
          "type": "select",
          "hidden": false,
          "options": {
            "type": "string",
            "data": ['get','post','put','delete']
          }
        },
        "url": {
          "type": "string",
          "hidden": false
        },
        "data": {
          "type": "textarea",
          "hidden": false
        },
        "use_prev_data": {
          "type": "checkbox",
          "hidden": false,
          "value": false
        }
      }
    },
    {
      "operatorName": "CSV",
      "attributes": {
        "operator_type": {
          "type": "string",
          "hidden": true,
          "value": "csvOperator.loadCsvFile"
        },
        "task_id": {
          "type": "string",
          "hidden": false,
          "value": ""
        },
        "file_name": {
          "type": "file",
          "hidden": false
        }
      }
    },
    {
      "operatorName": "JSON",
      "attributes": {
        "operator_type": {
          "type": "string",
          "hidden": true,
          "value": "jsonOperator.loadJsonFile"
        },
        "task_id": {
          "type": "string",
          "hidden": false,
          "value": ""
        },
        "file_name": {
          "type": "file",
          "hidden": false
        }
      }
    },
    {
      "operatorName": "ElasticSearch",
      "attributes": {
        "operator_type": {
          "type": "string",
          "hidden": true,
          "value": "elasticsearchOperator.es_search"
        },
        "task_id": {
          "type": "string",
          "hidden": false,
          "value": ""
        },
        "es_conn_id": {
          "type": "select",
          "hidden": false,
          "options": {
            "type": "url",
            "connection_type": "elasticsearch",
            "method": "GET",
            "data": "/connections"
          }
        },
        "index": {
          "type": "string",
          "hidden": false
        },
        "query": {
          "type": "textarea",
          "hidden": false
        },
      }
    }
  ],
  "Transform": [
    {
      "operatorName": "ObjectExtract",
      "attributes": {
        "operator_type": {
          "type": "string",
          "hidden": true,
          "value": "objectExtractOperator.extract"
        },
        "task_id": {
          "type": "string",
          "hidden": false,
          "value": ""
        },
        "options": {
          "type": "select",
          "value": "",
          "options": {
            "type": "string",
            "data": ["detection"]
          }
        },
        "return_image_url": {
          "type": "select",
          "value": "",
          "options": {
            "type": "string",
            "data": ["Yes", "No"]
          }
        },
        "type": {
          "type": "select",
          "value": "",
          "options": {
            "type": "string",
            "data": ['image']
          }
        },
        "img_url": {
          "type": "string",
          "value": ""
        },
        "use_prev_url": {
          "type": "checkbox",
          "hidden": false,
          "value": false
        },
        "program_info": {
          "type": "textarea",
          "value": {
            "program_id": "",
            "media_id": "",
            "program_path": "",
            "image_path_org": "",
            "frame_id": "",
            "frame_time": "",
            "return_image_url": "Yes"
          }
        }
      }
    },
    {
      "operatorName": "Mapping",
      "attributes": {
        "operator_type": {
          "type": "string",
          "hidden": true,
          "value": "mappingOperator.columnMapping"
        },
        "task_id": {
          "type": "string",
          "hidden": false,
          "value": ""
        },
        "map_fields": {
          "type": "textarea",
          "value": ""
        }
      }
    },
    {
      "operatorName": "Filter",
      "attributes": {
        "operator_type": {
          "type": "string",
          "hidden": true,
          "value": "filterOperator.filterOp"
        },
        "task_id": {
          "type": "string",
          "hidden": false,
          "value": ""
        },
        "columns": {
          "type": "string",
          "hidden": false,
          "inputValue": "",
          "value": []
        }
      }
    }
  ],
  "DataTarget": [
    {
      "operatorName": "CSV",
      "attributes": {
        "operator_type": {
          "type": "string",
          "hidden": true,
          "value": "csvOperator.saveCsvFile"
        },
        "task_id": {
          "type": "string",
          "hidden": false,
          "value": ""
        }
      }
    },
    {
      "operatorName": "JSON",
      "attributes": {
        "operator_type": {
          "type": "string",
          "hidden": true,
          "value": "jsonOperator.saveJsonFile"
        },
        "task_id": {
          "type": "string",
          "hidden": false,
          "value": ""
        }
      }
    },
    {
      "operatorName": "Minio",
      "attributes": {
        "operator_type": {
          "type": "string",
          "hidden": true,
          "value": "videoSplitOperator.fputObject"
        },
        "task_id": {
          "type": "string",
          "hidden": false,
          "value": ""
        }
      }
    },
    {
      "operatorName": "ElasticSearch.CustomData",
      "attributes": {
        "operator_type": {
          "type": "string",
          "hidden": true,
          "value": "elasticsearchOperator.es_add"
        },
        "task_id": {
          "type": "string",
          "hidden": false,
          "value": ""
        },
        "es_conn_id": {
          "type": "select",
          "hidden": false,
          "options": {
            "type": "url",
            "connection_type": "elasticsearch",
            "method": "GET",
            "data": "/connections"
          }
        },
        "index": {
          "type": "string",
          "hidden": false
        },
        "body": {
          "type": "textarea",
          "hidden": false
        },
      }
    },
    {
      "operatorName": "ElasticSearch.AutoSave",
      "attributes": {
        "operator_type": {
          "type": "string",
          "hidden": true,
          "value": "elasticsearchOperator.es_save"
        },
        "task_id": {
          "type": "string",
          "hidden": false,
          "value": ""
        },
        "es_conn_id": {
          "type": "select",
          "hidden": false,
          "options": {
            "type": "url",
            "connection_type": "elasticsearch",
            "method": "GET",
            "data": "/connections"
          }
        },
        "index": {
          "type": "string",
          "hidden": false
        },
        "data": {
          "type": "textarea",
          "hidden": false
        },
      }
    }
  ]
};
