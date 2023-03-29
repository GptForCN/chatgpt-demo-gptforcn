import { SHA256 } from 'crypto-js'
import type { AxiosProgressEvent, GenericAbortSignal } from 'axios'
import { post } from '@/utils/request'
import { useSettingStore } from '@/store'

export function fetchChatAPI<T = any>(
  prompt: string,
  options?: { conversationId?: string; parentMessageId?: string },
  signal?: GenericAbortSignal,
) {
  return post<T>({
    url: '/chat',
    data: { prompt, options },
    signal,
  })
}

export function fetchChatConfig<T = any>() {
  return post<T>({
    url: '/config',
  })
}

export function fetchChatAPIProcess<T = any>(
  params: {
    prompt: string
    options?: { conversationId?: string; parentMessageId?: string }
    signal?: GenericAbortSignal
    onDownloadProgress?: (progressEvent: AxiosProgressEvent) => void },
) {
  const settingStore = useSettingStore()
  const dataParams = { prompt: params.prompt, options: params.options, systemMessage: settingStore.systemMessage }
  // Sign GPTFORCN
  const signInfo = signData(dataParams)

  return post<T>({
    url: '/chat-process',
    data: dataParams,
    headers: { appId: signInfo.appId, timestamp: signInfo.timestamp, sign: signInfo.sign },
    signal: params.signal,
    onDownloadProgress: params.onDownloadProgress,
  })
}

function signData(dataParams: any){
  const json = dataParams? JSON.stringify(dataParams) : ''
  // Sign GPTFORCN
  const appId = import.meta.env.VITE_APP_API_ID? import.meta.env.VITE_APP_API_ID : localStorage.getItem('appId')
  const secret = import.meta.env.VITE_APP_API_SECRET? import.meta.env.VITE_APP_API_SECRET : localStorage.getItem('secret')
  const timenow = Date.now()
  const unSignStr = `appId=${appId}&appSecret=${secret}&data=${json}&timestamp=${timenow}`
  return {
    appId: appId,
    timestamp: timenow,
    sign: SHA256(unSignStr).toString()
  }
}

export function fetchSession<T>() {
  return post<T>({
    url: '/session',
  })
}

export function fetchVerify<T>(token: string) {
  return post<T>({
    url: '/verify',
    data: { token },
  })
}
