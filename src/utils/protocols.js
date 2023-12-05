
const dai1yProtocolUri = 'https://dai1y.app';
const dai1ySchemas = [
        'post',
        'follow',
        'bookmark',
        'image',
      ].reduce((obj, label) => {
        obj[label] = dai1yProtocolUri + '/schemas/' + label;
        return obj;
      }, {})

export const dai1y = {
  uri: dai1yProtocolUri,
  schemas: dai1ySchemas,
  definition: {
    published: true,
    protocol: dai1yProtocolUri,
    types: {
      post: {
        schema: dai1ySchemas.post,
        dataFormats: ['application/json']
      },
      image: {
        schema: dai1ySchemas.image,
        dataFormats: ['image/gif', 'image/png', 'image/jpeg']
      },
      follow: {
        schema: dai1ySchemas.follow,
        dataFormats: ['application/json']
      },
      bookmark: {
        schema: dai1ySchemas.bookmark,
        dataFormats: ['application/json']
      }
    },
    structure: {
      post: {
        image: {},
        comment: {
          $actions: [
            {
              role: 'follow',
              can: 'write'
            }
          ]
        }
      },
      follow: {
        $globalRole: true
      },
      bookmark: {}
    }
  }
}

const profileProtocolUri = "https://areweweb5yet.com/protocols/profile";
const profileSchemas = [
        'name',
        'social',
        'messaging',
        'phone',
        'address',
        'avatar',
        'hero',
      ].reduce((obj, label) => {
        obj[label] = profileProtocolUri + '/schemas/' + label;
        return obj;
      }, {})

export const profile = {
  uri: profileProtocolUri,
  schemas: profileSchemas,
  definition: {
    published: true,
    protocol: profileProtocolUri,
    types: {
      name: {
        schema: profileSchemas.name,
        dataFormats: ['application/json']
      },
      social: {
        schema: profileSchemas.social,
        dataFormats: ['application/json']
      },
      messaging: {
        schema: profileSchemas.messaging,
        dataFormats: ['application/json']
      },
      phone: {
        schema: profileSchemas.phone,
        dataFormats: ['application/json']
      },
      address: {
        schema: profileSchemas.address,
        dataFormats: ['application/json']
      },
      avatar: {
        schema: profileSchemas.avatar,
        dataFormats: ['image/gif', 'image/png', 'image/jpeg']
      },
      hero: {
        schema: profileSchemas.hero,
        dataFormats: ['image/gif', 'image/png', 'image/jpeg']
      }
    },
    structure: {
      social: {},
      avatar: {},
      hero: {},
      name: {},
      messaging: {},
      address: {},
      phone: {}
    }
  }
}
