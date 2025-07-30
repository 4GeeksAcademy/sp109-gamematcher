
import os
from flask_admin import Admin
from .models import db, User, Game, Genre, Platform, AdminUser
from flask_admin.contrib.sqla import ModelView


def setup_admin(app):
    app.secret_key = os.environ.get('FLASK_APP_KEY', 'sample key')
    app.config['FLASK_ADMIN_SWATCH'] = 'cerulean'

    # Crear la instancia del panel de administración
    admin_panel = Admin(app, name='GameMatcher Admin',
                        template_mode='bootstrap3')

    # Añadir modelos al panel de administración
    admin_panel.add_view(ModelView(User, db.session))
    admin_panel.add_view(ModelView(Game, db.session))
    admin_panel.add_view(ModelView(Genre, db.session))
    admin_panel.add_view(ModelView(Platform, db.session))
    admin_panel.add_view(ModelView(AdminUser, db.session))
  
