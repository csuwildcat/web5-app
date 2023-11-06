
import { toWebStream } from "./streams";
import * as protocols from './protocols';
class Datastore {

  constructor(options){
    this.did = options.did;
    this.dwn = options.web5.dwn;
    this.ready = this.installProtocols();
  }

  async installProtocols(){
    const response = await this.dwn.protocols.query({
      message: {
        filter: {
          protocol: protocols.dai1y.uri
        }
      }
    });
    if (response.protocols.length) {
      console.log('existing');
      return true;
    }
    else {
      console.log('installing');
      try {
        await Promise.all(
          Object.values(protocols).map(protocol => {
            console.log(protocol)
            return this.dwn.protocols.configure({
              message: {
                definition: protocol.definition
              }
            })
          })
        )
        console.log('installed');
      }
      catch (e) {
        console.log(e);
        return false;
      }
    }
  }

  async createSocial(json = {}){
    await this.ready;
    const { record } = await this.dwn.records.create({
      data: json,
      message: {
        protocol: protocols.profile.uri,
        protocolPath: 'social',
        schema: protocols.profile.schemas.social,
        dataFormat: 'application/json'
      }
    });
    console.log(record);
    return record;
  }

  async getSocial(options = {}){
    await this.ready;
    const params = {
      message: {
        filter: {
          protocol: protocols.profile.uri,
          protocolPath: 'social',
        },
        dateSort: 'createdDescending'
      }
    }
    if (options.from) params.from = options.from;
    const { records } = await this.dwn.records.query(params);
    return records[0];
  }

  async createPost(json = {}){
    await this.ready;
    const { record } = await this.dwn.records.create({
      data: json,
      message: {
        protocol: protocols.dai1y.uri,
        protocolPath: 'post',
        schema: protocols.dai1y.schemas.post,
        dataFormat: 'application/json'
      }
    });
    console.log(json);
    return record;
  }

  async getPost(postId){
    await this.ready;
    const { record, status } = await this.dwn.records.read({
      message: {
        filter: {
          recordId: postId
        }
      }
    });
    if (status.code !== 200) return false;
    return record;
  }

  async getPosts(options = {}){
    await this.ready;
    const filter = {
      protocol: protocols.dai1y.uri,
      schema: protocols.dai1y.schemas.post
    }
    if (options.published !== undefined) filter.published = options.published

    const params = {
      message: {
        filter: filter,
        dateSort: options.sort || 'createdDescending'
      },

    }
    if (options.from) params.from = options.from;

    const { records } = await this.dwn.records.query(params);

    return records
  }

  async createImage(file, format){
    await this.ready;
    const { record } = await this.dwn.records.create({
      data: file,
      message: {
        protocol: protocols.dai1y.uri,
        protocolPath: 'image',
        dataFormat: format
      }
    });
    record.blobUrl = URL.createObjectURL(await record.data.blob());
    return record;
  }

  async getImage(imageId){
    await this.ready;
    const { record } = await this.dwn.records.read({
      message: {
        filter: {
          recordId: imageId
        }
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