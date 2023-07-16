import { ref } from 'vue'
import moment from 'moment';
import Auth from '@/utils/auth'
// import { useQuasar } from 'quasar'
export const today = moment(Date.now()).format('MM/DD/YYYY')
export const yesterday = moment(getPreviousDay(new Date())).format('MM/DD/YYYY')
// type HeadersInit = string[][] | Record<string, string> | Headers;

// type BufferSource = ArrayBufferView | ArrayBuffer;
// type BodyInit = ReadableStream | XMLHttpRequestBodyInit;
// type XMLHttpRequestBodyInit = Blob | BufferSource | FormData | URLSearchParams | string;
// interface RequestInit {
//   /** A BodyInit object or null to set request's body. */
//   body?: BodyInit | null;

//   /** A Headers object, an object literal, or an array of two-item arrays to set request's headers. */
//   headers?: HeadersInit;
//   /** A cryptographic hash of the resource to be fetched by request. Sets request's integrity. */

//   /** A string to set request's method. */
//   method?: string;

// }

// const $q = useQuasar()
const dev = process.env.NODE_ENV !== 'production'
export const server = () => {
  if (dev) { return '/' }
  return 'https://prjcthunt-server.herokuapp.com/'
}

export const loginReminder = ref(false)
function getPreviousDay(date = new Date()) {
  const previous = new Date(date.getTime());
  previous.setDate(date.getDate() - 1)
  return previous;
}

export function highlight() {
  loginReminder.value = !loginReminder.value
  setTimeout(() => loginReminder.value = !loginReminder.value, 3000)
  return
}

export async function getVotes(projectID: string) {
  const response = await fetch(`${server()}proj/upvotes/${projectID}`, requestOptions());
  const res = await response.json()
  const voteList = await res.upvotes.map((v: any) => v.token)
  // console.log({ voteList })
  return voteList
}

// ! WTF WERE YOU THINKING HERE???
export function votedCheck(upvotes: any, tokenID: string) {
  upvotes = upvotes.map((v: any) => v.token)
  const result = upvotes.includes(tokenID) //? true : false

  return result
}

export function requestOptions(data?: any) {
  let headers: any = {
    'Content-Type': 'application/json'
  }
  const token = Auth.getToken()
  if (token) {
    headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  }
  let options: any = {
    method: 'GET',
    headers: headers
  }

  if (data) {
    // console.log(typeof data)
    options = {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data)
    }
  }
  return options;

}

export async function removeFavorite(data: { target: string }) {
  const removeFav = await fetch(`${server()}user/rmFav`, requestOptions(data))
  if (!removeFav.ok) {
    return false;
  }
  return true;
}
export async function addFavorite(data: { target: string }) {
  const addFav = await fetch(`${server()}user/addFav`, requestOptions(data))
  if (!addFav.ok) {
    return false;
  }
  return true;
}


export async function earnToken(pubkey: string, task: string) {
  if (!pubkey || !task) {
    console.log(`Bad Request: \n\nPK:${pubkey}\nTask:${task}`)
    return
  }
  try {
    console.log('earnToken', pubkey, task)
    const result = await fetch(`${server()}token/send`, requestOptions({ walletString: pubkey, task: task }))
    if (result.status === 200) {
      const res = await result.json()
      console.log('EARN TOKEN RES:', res)
      const notiInfo = {
        // type: 'success',
        icon: 'grade',
        color: 'secondary',
        message: '$FIRE Earned',
        caption: res.message,
        position: 'top',
        timeout: 10000
      }
      return notiInfo
    }
  } catch (err) {
    console.log(err)
    return
  }

}