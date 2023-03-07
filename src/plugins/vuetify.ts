// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Vuetify
import { createVuetify } from 'vuetify'

export default createVuetify({
    theme: {
        defaultTheme: 'myCustomTheme',
        themes: {
            myCustomTheme: {
                colors: {
                    primary: '#1976d2'
                }
            }
        }
    }
}
  // https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
)
