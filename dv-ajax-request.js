class DvAjaxRequest {
    static serialize(obj, prefix) {
        let str = [], p;
        for (p in obj) {
            if (obj.hasOwnProperty(p)) {
                let k = prefix ? prefix + "[" + p + "]" : p,
                    v = obj[p];
                str.push((v !== null && typeof v === "object") ?
                    DvAjaxRequest.serialize(v, k) :
                    encodeURIComponent(k) + "=" + encodeURIComponent(v ?? ''));
            }
        }
        return str.join("&");
    }

    static request(method, url, data) {
        let strData;
        if (typeof data === 'object' && data !== null) {
            strData = DvAjaxRequest.serialize(data);
        } else {
            strData = data;
        }
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            xhr.open(method, url + ((method === 'GET' && strData) ? '?' + strData : ''));
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            if (method === 'POST') {
                xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
            }
            xhr.onload = function() {
                if (xhr.status !== 200) {
                    return reject(new Error('Request failed. Returned status of ' + xhr.status));
                }
                if (xhr.getResponseHeader('Content-Type') === 'application/json') {
                    let result = JSON.parse(xhr.responseText) ?? xhr.responseText;
                    if (!result) {
                        return reject('Request failed. Invalid response.');
                    }
                    if (!result['status']) {
                        return resolve(result);
                    }
                    if (result['status'] === 'error') {
                        return reject(new Error(result['message'] ?? 'Unknown error'));
                    } else if (result['status'] === 'ok') {
                        return resolve(result);
                    } else {
                        return reject(new Error('Unknown result status: ' + result['status']));
                    }
                } else {
                    resolve(xhr.responseText);
                }
            };
            xhr.send(method === 'POST' ? strData : null);
        })
    }
    static get(url, data) {
        return DvAjaxRequest.request('GET', url, data);
    }
    static post(url, data) {
        return DvAjaxRequest.request('POST', url, data);
    }
}