const lambdaUrl = ''; // your api url

const template = `
<div>
  <input type="file" name="file" />
  <button type="button">Upload</button>
</div>
`;

class XUploader extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = template;
    this.shadowRoot.querySelector('button').addEventListener('click', this.onClick);
  }

  getUploadUrl = ({ url, filename, mimetype }) =>
    fetch(`${url}?filename=${filename}&mimetype=${mimetype}`);

  putFile = ({ url, file, type }) =>
    fetch(url, { method: 'PUT', headers: { 'Content-Type': type }, body: file });

  dispatch = ({ url, name }) => {
    const event = new CustomEvent('uploaded', { detail: { url, name } });
    window.dispatchEvent(event);
  };

  onClick = async e => {
    e.preventDefault();
    const inputFile = this.shadowRoot.querySelector('input[name="file"]');
    const file = inputFile.files[0];
    const { name, type } = file;

    try {
      const getUploadUrlResponse = await this.getUploadUrl({
        url: lambdaUrl,
        filename: name,
        mimetype: type,
      });
      const { url, bucket } = await getUploadUrlResponse.json();
      const putFileResponse = await this.putFile({ url, file, type });
      if (putFileResponse.ok) {
        this.dispatch({ url: `https://s3-ap-northeast-1.amazonaws.com/${bucket}/${name}`, name });
      } else {
        console.log(putFileResponse);
      }
    } catch (e) {
      console.log(e);
    }
  };
}

window.customElements.define('x-uploader', XUploader);
