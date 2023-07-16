// import Gun from 'gun/gun'
// import 'gun/sea'
// import 'gun/axe'
// import store from '@/store'



// export const gun = new Gun({ peers: ["http://localhost:8555/gun"], port: 8555 })
// // console.log({ Gun: gun.opt() })

// // USER AUTH STUFF
// export const user = gun.user().recall({ sessionStorage: true });
// export const username = user.get('alias')

// if (user.is) {
//     console.log('user.is: true');
// } else {
//     console.log('user.is:false');
// }
// user.get('alias').on((v: string) => store.commit('setUsername', v))

// gun.on('auth', async (event: any) => {
//     const alias = await user.get('alias');
//     store.commit('setUsername', alias);

//     console.log(`Signed in as ${alias}`)
// })

// export const makeObjFromArr = (arr: any[]) => {
//     let id = 0
//     const result = arr.reduce((acc, item) => {
//         return {
//             ...acc,
//             [id]: item,
//         }
//     }, {});
//     id++;
//     console.log({ mofa: result })
//     return result;
// };
