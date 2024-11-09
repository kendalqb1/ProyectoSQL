import useSWR from "swr";

const fetchTimeout = 1200000;

const getBaseUrl = () => {
    return `https://g0gvozvhib.execute-api.us-east-1.amazonaws.com/get/select?api_key=5edbcdc9-caee-45fe-afe8-8aead9b8d263`
}

const fetchWithTimeout = async (resource, options) => {
    const { timeout = fetchTimeout } = options;

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(resource, {
        ...options,
        signal: controller.signal,
    });
    clearTimeout(id);
    return response;
}

const getProxy = async (url, options) => {
    return fetchWithTimeout(url, options).then((response) => {
        if (response.status >= 200 && response.status <= 299) {
            return response.json();
        } else {
            const errorMessage = `Error ${response.statusText} - Response status ${response.status} - ${url}`;
            console.log(errorMessage);
            throw (errorMessage);
        }
    })
        .then((rawResponse) => {
            return {
                "statusDesc": "SUCCESS",
                ...rawResponse
            }
        })
        .catch(error => {
            return {
                "statusDesc": "ERROR"
            }
        });
}

export function GetAllData(
    firstLoad,
    body
) {
    const url = `${getBaseUrl()}`
    const options = {
        method: "POST",
        mode: "cors",
        body: JSON.stringify(body)
    }

    const swrKey = firstLoad && [url, options];
    const { data, error, isLoading } = useSWR(swrKey, ([url, options]) => getProxy(url, options), {
        refreshInterval: 60000,
    });

    return {
        queryData: data,
        error: error,
        isLoading: isLoading
    }
}