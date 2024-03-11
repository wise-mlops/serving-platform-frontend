export { };

declare global {
  // http response body
  interface ResponseBody {
    code: number;
    message?: string;
    result: any;
  }

  type status = 'True' | 'False' | 'Unknown';

  interface InferenceServiceDetail {
    name: string,
    modelFormat: string,
    creationTimestamp: string,
    status: status
  }

  interface InferenceServicesResponsebody extends ResponseBody {
    result: {
      total_result_details: number,
      result_details: InferenceServiceDetail[]
    }
  }

  interface DetailOverview {
    info: {
      status: status,
      api_url: string,
      storage_uri: string,
      model_format: string
    },
    inference_service_conditions: {
      lastTransitionTime: string,
      severity?: string,
      status: status,
      type: string
    }[]
  }

  interface DetailDetails {
    info: {
      status: status,
      name: string,
      namespace: string,
      url: string,
      annotations: {
        'sidecar.istio.io/inject': string
      },
      creation_timestamp: string
    },
    predictor_spec: {
      storage_uri: string,
      model_format: string,
      service_account: string
    }
  }

  interface InferenceServiceDetailResponsebody extends ResponseBody {
    result: {
      name: string,
      overview: DetailOverview,
      details: DetailDetails
    }
  }

  interface BucketDetail {
    _name: string,
    _creation_date: string
  }

  interface BucketsResponsebody extends ResponseBody {
    result: {
      message: {
        total_result_details: number,
        result_details: BucketDetail[]
      }
    }
  }

  interface ObjectDetail {
    _object_name: string,
    _last_modified: string | null,
    _size: number | null
  }

  interface ObjectsResponsebody extends ResponseBody {
    result: {
      message: {
        total_result_details: number,
        result_details: ObjectDetail[]
      }
    }
  }
}