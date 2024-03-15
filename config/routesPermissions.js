import ROLES_LIST from "./rolesList"

const PERMISSIONS = {
    "users" : {
        '/search/:userid?': ROLES_LIST['Admin'],
        '/search/:userid?': ROLES_LIST['Admin'], 
        '/all': ROLES_LIST['Admin'], 
        '/register': ROLES_LIST['Admin'], 
        '/login': 0,
        '/refresh': ROLES_LIST['Admin'],
        '/logout': ROLES_LIST['User']

    }
} 

export {PERMISSIONS}