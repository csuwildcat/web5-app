

import { ProfileCard } from '../components/profile-card';
import { DOM, notify } from '../utils/helpers.js';

let entries = new Set();

function initialize(){
  return initialize.promise || (initialize.promise = new Promise(async resolve => {
    await fetch();
    resolve();
  }))
}

async function fetch (cursor){
  const records = await datastore.queryFollows();
  records.forEach(record => record.isDeleted || entries.add(record.recipient))
}

async function get(did){
  return datastore.queryFollows({ recipient: did, latestRecord: true })
}

async function toggle (did){
  let state = !entries.has(did);
  await datastore.toggleFollow(did, state);
  state ? entries.add(did) : entries.delete(did);
  DOM.fireEvent(document, 'follow-change', {
    composed: true,
    detail: {
      did: did,
      following: state
    }
  });
  notify.success(state ? 'Follow added' : 'Follow removed');
  return state;
}

document.addEventListener('follow-change', e => {
  const did = e.detail.did;
  const following = e.detail.following;
  following ? entries.add(did) : entries.delete(did);
  for (const instance of ProfileCard.instances) {
    if (instance.did === did) {
      instance.following = following;
    }
  }
})

export {
  initialize,
  entries,
  fetch,
  toggle,
  get
}




