export { };

declare global {
    interface BucketDetail {
        _name: string,
        _creation_date: string
    }

    interface BucketsResponsebody extends ResponseBody {
        result: {
            total_result_details: number,
            result_details: BucketDetail[]
        }
    }

    interface ObjectDetail {
        _object_name: string,
        _last_modified: string | null,
        _size: number | null
    }

    interface ObjectsResponsebody extends ResponseBody {
        result: {
            total_result_details: number,
            result_details: ObjectDetail[]
        }
    }
}