import { aws } from "utils/services/api_services/aws_service";
import moment from "moment";

export const uploadToS3 = (url, file, contentType) => {
  return new Promise(function (resolve, reject) {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          console.log("Image successfully uploaded to S3");
          resolve(true);
        } else {
          console.log("Error while sending the image to S3");
          reject({
            status: this.status,
            statusText: xhr.statusText,
          });
          resolve(false);
        }
      }
    };
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.send(file, contentType);
  });
};

export const getUploadUrl = async (params, data) => {
  return await aws.create(params, data).then((res) => {
    return res;
  });
};

export const b64toBlob = (b64Data, contentType, sliceSize) => {
  contentType = contentType || "";
  sliceSize = sliceSize || 512;

  var byteCharacters = atob(b64Data);
  var byteArrays = [];

  for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    var slice = byteCharacters.slice(offset, offset + sliceSize);

    var byteNumbers = new Array(slice.length);
    for (var i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    var byteArray = new Uint8Array(byteNumbers);

    byteArrays.push(byteArray);
  }

  var blob = new Blob(byteArrays, { type: contentType });
  return blob;
};

export const bytesToSize = (bytes) => {
  var sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "0 Byte";
  var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + " " + sizes[i];
};

export const dateToString = (date, format) => {
  return moment(date).format(format);
};
