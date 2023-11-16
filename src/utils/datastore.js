
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

  async getProtocol(protocolUri, options){
    const params = {
      from: options.from,
      message: {
        filter: {
          protocol: protocolUri,
        }
      }
    }
    const { protocols } = await this.dwn.protocols.query(params);
    return protocols[0];
  }

  async queryProtocolRecords(protocol, path, options = {}){
    await this.ready;
    const params = {
      message: {
        filter: {
          protocol: protocols[protocol].uri,
          protocolPath: path,
        }
      }
    }
    if (options.from) params.from = options.from;
    if (options.published !== undefined) {
      params.message.filter.published = options.published
    }
    if (options.sort || options.latestRecord) {
      params.message.dateSort = options.latestRecord ? 'createdDescending' : options.sort;
    }

    const { records } = await this.dwn.records.query(params);
    return options.latestRecord ? records[0] : records;
  }

  async createProtocolRecord(protocol, path, options = {}){
    await this.ready;
    const params = {
      message: {
        protocol: protocols[protocol].uri,
        protocolPath: path
      }
    }
    const schema = protocols[protocol].schemas[path.split('/').pop()];
    if (schema) params.message.schema = schema;
    if (options.from) params.from = options.from;
    if (options.data) params.data = options.data;
    if (options.dataFormat) params.message.dataFormat = options.dataFormat;
    const { record } = await this.dwn.records.create(params);
    record.send(this.did).then(e => {
      console.log(e)
    }).catch(e => {
      console.log(e)
    });
    return record;
  }

  getSocial = (options = {}) => this.queryProtocolRecords('profile', 'social', {
    latestRecord: true
  })

  createSocial = (options = {}) => this.createProtocolRecord('profile', 'social', {
    data: options.data,
    dataFormat: 'application/json'
  })

  createPost = (options = {}) => this.createProtocolRecord('dai1y', 'post', {
    data: options.data,
    dataFormat: 'text/markdown'
  })

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

  async readAvatar(id){
    await this.ready;
    const { record, status } = await this.dwn.records.read({
      message: {
        filter: {
          recordId: id
        }
      }
    });
    if (status.code !== 200) return false;
    return record;
  }

  getPosts = (options = {}) => this.queryProtocolRecords('dai1y', 'post', options)

  getAvatar = (options = {}) => this.queryProtocolRecords('profile', 'avatar', Object.assign({
    latestRecord: true
  }, options))

  createAvatar = (options = {}) => {
    if (options.data && options.data instanceof File) {
      const type = options.data.type;
      options.data = new Blob([options.data], { type });
      options.dataFormat = type;
    }
    return this.createProtocolRecord('profile', 'avatar', options)
  }

}


export {
  Datastore
}