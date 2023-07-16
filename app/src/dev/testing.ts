import { requestOptions, today, yesterday } from '@/utils/helpers';
import store from '@/store';




export async function handleCheckGunDB() {
  console.clear();
  console.log({ today });
  console.log({ yesterday });
}
export async function handleCheckStore() {
  console.clear();
  console.log('STORE: \n')

//   const data = { target: 'projID', token: 'tokenID', voter: 'voterID' }
  const response = await fetch('https://prjcthunt-server.herokuapp.com/user', requestOptions())
  const res = await response.json()
  console.log({res})
  console.dir(store.state)
  console.log(Date.now())
}