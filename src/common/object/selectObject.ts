import { obj2xml } from '../utils/obj2xml';
import { base64encode } from 'utility';

type InputCSV = {
  FileHeaderInfo?: string;
  FieldDelimiter?: string;
  RecordDelimiter?: string;
  QuoteCharacter?: string;
  CommentCharacter?: string;
  Range?: string;
  AllowQuotedRecordDelimiter?: boolean;
};
type OutputCSV = {
  RecordDelimiter?: string;
  FieldDelimiter?: string;
};

type InputJSON = {
  Type?: string;
  Range?: string;
  ParseJsonNumberAsString?: boolean;
};

type OutputJSON = {
  RecordDelimiter?: string;
};

type InputSerialization = {
  CompressionType?: string;
  CSV?: InputCSV;
  JSON?: InputJSON;
};

type OutputSerialization = {
  CSV?: OutputCSV;
  JSON?: OutputJSON;
  OutputRawData?: boolean;
  KeepAllColumns?: boolean;
  EnablePayloadCrc?: boolean;
  OutputHeader?: boolean;
};

type Other = {
  SkipPartialDataRecord?: boolean;
  MaxSkippedRecordsAllowed?: number;
};

type SelectRequest = {
  Expression?: string;
  InputSerialization?: InputSerialization;
  OutputSerialization?: OutputSerialization;
  Options?: Other;
};

type ParamsXMLObj = {
  SelectRequest: SelectRequest;
};

const needToEncode: string[] = ['RecordDelimiter', 'FieldDelimiter', 'QuoteCharacter', 'CommentCharacter'];

export async function selectObject(this: any, name: string, expression: string, process: string, options: any) {
  if (!['json', 'csv'].includes(process.toLocaleLowerCase())) {
    throw new Error('process must be json or csv');
  }
  const opts = Object.assign({}, options);

  opts.subres = Object.assign({ 'x-oss-process': `${process}/select` });

  let InputSerialization: InputSerialization;
  let OutputSerialization: OutputSerialization;
  let Options: Other;

  const paramsXMLObj: ParamsXMLObj = {
    SelectRequest: {
      Expression: base64encode(expression)
    }
  };

  // CompressionType
  if (opts.InputSerialization) {
    opts.InputSerialization.CompressionType = opts.InputSerialization.CompressionType
      ? opts.InputSerialization.CompressionType
      : 'None';
  }

  // CSV
  if (process.toLocaleLowerCase() === 'csv') {
    // inputSerialization
    if (opts.InputSerialization && opts.InputSerialization.CSV) {
      Object.keys(opts.InputSerialization.CSV).forEach(i => {
        if (needToEncode.includes(i)) {
          opts.InputSerialization.CSV[i] = base64encode(opts.InputSerialization.CSV[i]);
        }
      });
    }
    InputSerialization = Object.assign({}, opts.InputSerialization);
    paramsXMLObj.SelectRequest.InputSerialization = InputSerialization;

    // OutputSerialization
    if (opts.OutputSerialization && opts.OutputSerialization.CSV) {
      Object.keys(opts.OutputSerialization.CSV).forEach(i => {
        if (needToEncode.includes(i)) {
          opts.OutputSerialization.CSV[i] = base64encode(opts.OutputSerialization.CSV[i]);
        }
      });
    }
    OutputSerialization = Object.assign({}, opts.OutputSerialization);
    paramsXMLObj.SelectRequest.OutputSerialization = OutputSerialization;
  }

  // JSON
  if (process.toLowerCase() === 'json') {
    // InputSerialization
    if (opts.InputSerialization && opts.InputSerialization.JSON) {
      opts.InputSerialization.JSON.Type = opts.InputSerialization.JSON.Type
        ? opts.InputSerialization.JSON.Type.toUpperCase()
        : 'DOCUMENT';

      opts.InputSerialization.JSON = Object.assign({}, opts.inputSerialization.JSON);
    }
    InputSerialization = Object.assign({}, opts.InputSerialization);
    paramsXMLObj.SelectRequest.InputSerialization = InputSerialization;

    // OutputSerialization
    if (opts.OutputSerialization && opts.OutputSerialization.JSON) {
      if (opts.OutputSerialization.JSON.RecordDelimiter) {
        opts.OutputSerialization.JSON.RecordDelimiter = base64encode(opts.OutputSerialization.JSON.RecordDelimiter);
      }
    }
    OutputSerialization = Object.assign({}, opts.OutputSerialization);
    paramsXMLObj.SelectRequest.OutputSerialization = OutputSerialization;
  }

  // Options
  if (opts.Other) {
    Options = Object.assign({}, opts.Other);
    paramsXMLObj.SelectRequest.Options = Options;
  }

  const params = this._objectRequestParams('POST', name, opts);
  params.content = obj2xml(paramsXMLObj);
  params.mime = 'xml';
  params.successStatuses = [206];

  const result = await this.request(params);
  // const version = result.data.slice(0, 1);
  // const frameType = result.data.slice(1, 4);
  // const payload = result.data.slice(4, 8);
  console.log(result.data.slice(20, result.data.length - 41).toString());

  return result.data;
}
