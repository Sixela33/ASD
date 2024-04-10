import ROLES_LIST from "../../../config/rolesList"
export const permissionsRequired = {
    'vew_projects_page': ROLES_LIST['User'],
    'vew_flowers_page': ROLES_LIST['User'],
    'vew_invoices_page': ROLES_LIST['Admin'],
    'vew_admin_page': ROLES_LIST['Admin'],
    
    'veiw_flower_statistics': ROLES_LIST['Admin'],
    'veiw_project_statistics': ROLES_LIST['Admin'],

    'create_new_flower': ROLES_LIST['Admin'],
    'create_new_project': ROLES_LIST['Admin'],
    'create_new_invoice': ROLES_LIST['Admin'],

    'edit_invoice': ROLES_LIST['Admin'],
    'edit_arrangement': ROLES_LIST['Admin'],
    'add_arrangement': ROLES_LIST['Admin'],
    'edit_project_data': ROLES_LIST['Admin'],
    'remove_arrangement': ROLES_LIST['Admin'],
    'close_project': ROLES_LIST['Admin'],
    'change_stem': ROLES_LIST['User'],
    'download_invoice': ROLES_LIST['Admin']
}
