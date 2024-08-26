import axios from 'axios'

export const proxyFetch = async(url: string) => {
    const proxyConfig = {
        host: '45.196.48.9',
        port: 5435,
        auth: {
          username: 'jtzhwqur',
          password: 'jnf0t0n2tecg',
        },
    }

    try {
        const response = await axios.get(url, {proxy: proxyConfig})
        return response.data
    } catch (error) {
        console.log(error)
    }
}