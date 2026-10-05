# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_10_02_183213) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.string "service_name", null: false
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "editals", force: :cascade do |t|
    t.string "arquivo_nome"
    t.date "data_publicacao"
    t.string "tipo"
    t.string "arquivo_hash"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["arquivo_hash"], name: "index_editals_on_arquivo_hash", unique: true
  end

  create_table "equipamentos", force: :cascade do |t|
    t.string "identificacao"
    t.text "endereco"
    t.float "latitude"
    t.float "longitude"
    t.string "tipo"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "infracoes", force: :cascade do |t|
    t.bigint "edital_id", null: false
    t.string "placa"
    t.date "data_infracao"
    t.decimal "valor", precision: 10, scale: 2
    t.string "auto_infracao"
    t.string "codigo_infracao"
    t.integer "ano_notificacao"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "amparo_legal"
    t.index ["edital_id"], name: "index_infracoes_on_edital_id"
    t.index ["placa"], name: "index_infracoes_on_placa"
  end

  create_table "usuarios", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "admin", default: false
    t.string "nome"
    t.boolean "ativo"
    t.index ["email"], name: "index_usuarios_on_email", unique: true
    t.index ["reset_password_token"], name: "index_usuarios_on_reset_password_token", unique: true
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "infracoes", "editals"
end
