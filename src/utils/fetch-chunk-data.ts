import qs from 'query-string';

/**
 *
 * @param params data: for post request, params: for get request
 * @returns
 */
export const fetchChunkedData = async (params: {
  data?: any;
  url: string;
  params?: any;
  method?: string;
}) => {
  const method = params.method || 'POST';
  let url = params.url;
  if (params.params) {
    url = `${url}?${qs.stringify(params.params)}`;
  }
  const response = await fetch(url, {
    method,
    body: method === 'POST' ? JSON.stringify(params.data) : null,
    headers: {
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
    return null;
  }
  const reader = response?.body?.getReader();
  const decoder = new TextDecoder('utf-8');
  return {
    reader,
    decoder
  };
};

export const readStreamData = async (
  reader: any,
  decoder: TextDecoder,
  callback: (data: any) => void
) => {
  const { done, value } = await reader.read();

  if (done) {
    return;
  }

  let chunk = decoder.decode(value, { stream: true });
  console.log('chunk==========', chunk);
  callback(chunk);
  await readStreamData(reader, decoder, callback);
};
