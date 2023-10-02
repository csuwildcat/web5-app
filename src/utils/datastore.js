
import { toWebStream } from "./streams";

class Datastore {

  constructor(options){
    this.did = options.did;
    this.dwn = options.web5.dwn;
    this.ready = new Promise(resolve => {
      this.getProtocol().then(async response => {
        if (response.protocols.length) {
          console.log('existing');
          resolve();
        }
        else {
          console.log('new');
          this.setProtocol().then(z => resolve());
        }
      })
    })
  }

  protocolUri = 'urn:example';
  postSchema = 'urn:example/post';

  getProtocol(){
    return this.dwn.protocols.query({
      message: {
        filter: {
          protocol: this.protocolUri
        }
      }
    });
  }

  setProtocol(){
    return this.dwn.protocols.configure({
      message: {
        definition: {
          protocol: this.protocolUri,
          types: {
            post: {
              schema: this.postSchema,
              dataFormats: ['application/json']
            },
            image: {
              dataFormats: ['image/gif', 'image/x-png', 'image/jpeg']
            }
          },
          structure: {
            post: {},
            image: {}
          }
        }
      }
    });
  }
  async createPost(json, format){
    const { record } = await this.dwn.records.create({
      data: json,
      message: {
        protocol: this.protocolUri,
        protocolPath: 'post',
        schema: this.postSchema,
        dataFormat: 'application/json'
      }
    });
    record.json = await record.data.json();
    return record;
  }

  async getPost(postId){
    const { record, status } = await this.dwn.records.read({
      message: {
        recordId: postId
      }
    });
    if (status.code !== 200) return false;
    record.postData = await record.data.json();
    return record;
  }

  async getPosts(){
    const { records } = await this.dwn.records.query({
      message: {
        filter: {
          protocol: this.protocolUri,
          schema: this.postSchema
        }
      }
    });
    return Promise.all(records.map(async entry => {
      const json = await entry.data.json()
      entry.postData = json;
      return entry;
    }))
  }

  async createImage(file, format){
    const { record } = await this.dwn.records.create({
      data: file,
      message: {
        protocol: this.protocolUri,
        protocolPath: 'image',
        dataFormat: format
      }
    });
    record.blobUrl = URL.createObjectURL(await record.data.blob());
    return record;
  }

  async getImage(imageId){
    const { record } = await this.dwn.records.read({
      message: {
        recordId: imageId
      }
    });
    if (!record) return;
    record.blobUrl = URL.createObjectURL(await record.data.blob());
    return record;
  }

}


export {
  Datastore
}