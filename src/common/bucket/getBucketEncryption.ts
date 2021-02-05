import { checkBucketName } from '../utils/checkBucketName';
import { RequestOptions } from '../../types/params';
import { GetBucketEncryptionReturnType } from '../../types/bucket';
import { _bucketRequestParams } from '../client/_bucketRequestParams';
import { Client } from '../../setConfig';

/**
 * getBucketEncryption
 * @param {String} bucketName - bucket name
 */

export async function getBucketEncryption(
  this: Client,
  bucketName: string,
  options: RequestOptions = {}
):Promise<GetBucketEncryptionReturnType> {
  checkBucketName(bucketName);
  const params = _bucketRequestParams(
    'GET',
    bucketName,
    'encryption',
    options
  );
  params.successStatuses = [200];
  params.xmlResponse = true;
  const result = await this.request(params);
  const encryption = result.data.ApplyServerSideEncryptionByDefault;
  return {
    encryption,
    status: result.status,
    res: result.res,
  };
}