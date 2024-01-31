
import { toWebStream } from "./streams";
import * as protocols from './protocols';

setInterval(() => Datastore.cache = {}, 1000 * 60 * 60)

class Datastore {

  static cache = {}
  static setCache(did, key, value){
    (Datastore.cache[did] || (Datastore.cache[did] = {}))[key] = value;
  }
  static getCache(did, key){
    return Datastore.cache?.[did]?.[key];
  }

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
          Object.values(protocols).map(async _protocol => {

            const { protocol } = await this.dwn.protocols.configure({
              message: {
                definition: _protocol.definition
              }
            })
            await protocol.send(this.did);
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

  async getProtocol(protocolUri, options = {}){
    const params = {
      from: options.from,
      message: {
        filter: {
          protocol: protocolUri,
        }
      }
    }
    const { protocols, status } = await this.dwn.protocols.query(params);
    return { protocol: protocols[0], status };
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
    if (options.recipient !== undefined) {
      params.message.filter.recipient = options.recipient
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
        protocolPath: path,
        schema: protocols[protocol][path.split('/').pop()]
      }
    }
    const schema = protocols[protocol].schemas[path.split('/').pop()];
    if (schema) params.message.schema = schema;
    if (options.from) params.from = options.from;
    if (options.data) params.data = options.data;
    if (options.dataFormat) params.message.dataFormat = options.dataFormat;
    if (options.published !== undefined) params.message.published = options.published;
    if (options.recipient) params.message.recipient = options.recipient;
    console.log(params);
    const { record } = await this.dwn.records.create(params);
    await record.send(this.did).then(e => {
      console.log(e)
    }).catch(e => {
      console.log(e)
    });
    console.log(record);
    return record;
  }

  async getSocial(options = {}) {
    await this.ready;
    const did = options.from || this.did;
    if (did !== this.did) {
      const cached = Datastore.getCache(did, 'social');
      if (cached) return cached;
    }
    const record = await this.queryProtocolRecords('profile', 'social', Object.assign({
      latestRecord: true
    }, options))
    if (!record) return;
    record.cache = {
      json: await record.data.json()
    }
    Datastore.setCache(did, 'social', record);
    return record;
  }

  async createSocial(options = {}) {
    const record = await this.createProtocolRecord('profile', 'social', {
      published: true,
      data: options.data,
      dataFormat: 'application/json'
    })
    record.cache = {
      json: await record.data.json()
    }
    return record;
  }

  createPost = (options = {}) => this.createProtocolRecord('dai1y', 'post', {
    data: options.data,
    dataFormat: 'application/json'
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

  async readAvatar(did, returnAs){
    await this.ready;
    if (did !== this.did) {
      const cached = Datastore.getCache(did, 'avatar');
      if (cached) return cached;
    }
    const record = await this.getAvatar({ from: did });
    const blob = await record.data.blob();
    record.cache = {
      blob: blob,
      uri: URL.createObjectURL(blob)
    }
    if (did !== this.did) Datastore.setCache(did, 'avatar', record);
    return record;
  }

  async readPost(did, id){
    await this.ready;
    const { record, status } = await this.dwn.records.read({
      from: did,
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

  getPostsAfter = (options = {}) => {
    return this.queryProtocolRecords('profile', 'avatar', Object.assign({
      sort: 'createdDescending',
      filter: { datePublished: { from: randomDate } },
    }, options))
  }

  getPostsBefore(){
    console.log(follows.entries);
  }

  getAvatar = (options = {}) => this.queryProtocolRecords('profile', 'avatar', Object.assign({
    latestRecord: true
  }, options))

  createAvatar = (options = {}) => {
    if (options.data) {
      options.dataFormat = options.data.type;
      if (options.data instanceof File) {
        options.data = new Blob([options.data], { type: options.dataFormat });
      }
    }
    options.published = true;
    return this.createProtocolRecord('profile', 'avatar', options)
  }

  queryFollows = (options = {}) => this.queryProtocolRecords('dai1y', 'follow', options)

  async toggleFollow(did, follow){
    await datastore.queryFollows({ recipient: did, latestRecord: true }).then(async (record) => {
      if (record) {
        console.log(record);
        if (follow && record.isDeleted) record.update();
        else if (!follow) {
          const { record: deleted } = await this.dwn.records.delete({
            message: {
              recordId: record.id,
            }
          });
          record = deleted;
        }
        return record;
      }
      else {
        const { record, status } = await datastore.createProtocolRecord('dai1y', 'follow', { recipient: did, dataFormat: 'application/json' })
        return record;
      }
    })
  }

}


export {
  Datastore
}