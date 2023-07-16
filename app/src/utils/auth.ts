// use this to decode a token and get the user's information out of it
import decode from 'jwt-decode';

// create a new class to instantiate for a user
class AuthService {
    // get user data
    getProfile() {
        let token: any = this.getToken();
        if (token) {
            token = decode(token)
            // console.log(token.data)
            return token
        }

    }

    // check if user's logged in
    loggedIn() {
        // Checks if there is a saved token and it's still valid
        const token = this.getToken();
        return !!token && !this.isTokenExpired(token); // handwaiving here
    }

    // check if token is expired
    isTokenExpired(token: any) {
        try {
            const decoded: any = decode(token);
            // console.log({ decoded })
            if (decoded.exp < Date.now() / 1000) {
                // console.log({ expired: true })
                return true;
            } else return false;
        } catch (err) {
            return false;
        }
    }

    getToken() {
        // Retrieves the user token from localStorage
        return localStorage.getItem('prjct_token');
    }

    login(idToken: any) {
        localStorage.removeItem('prjct_token');
        // Saves user token to localStorage
        localStorage.setItem('prjct_token', idToken);
        // window.location.assign('/');
    }

    logout() {
        // Clear user token and profile data from localStorage
        localStorage.removeItem('prjct_token');
        // this will reload the page and reset the state of the application
        window.location.assign('#/login');
    }
}

export default new AuthService();