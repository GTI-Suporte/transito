# app/controllers/admin/editais_controller.rb
class Admin::EditaisController < ApplicationController
  # O ApplicationController já exige o login (authenticate_usuario!).
  # Adicionamos uma camada extra para garantir que só os admins acedem:
  before_action :verificar_admin

  def index
    @editais = Edital.order(created_at: :desc)
    @total_editais = Edital.count
    @total_placas = Infracao.count
  end

  def create
    if params[:file].blank?
      return redirect_to admin_editais_path, alert: 'Selecione um ficheiro PDF.'
    end

    hash_real = Digest::SHA256.file(params[:file].tempfile).hexdigest

    edital = Edital.new(
      arquivo_nome: params[:file].original_filename,
      data_publicacao: params[:data_publicacao],
      tipo: params[:tipo],
      arquivo_hash: hash_real
    )
    edital.arquivo_pdf.attach(params[:file])

    if edital.save
      # Processamento direto e garantido
      ExtratorPdfService.new(edital).call
      redirect_to admin_editais_path, notice: "Ficheiro processado com sucesso! Os registos foram adicionados."
    else
      redirect_to admin_editais_path, alert: edital.errors.full_messages.join(', ')
    end
  end

  def destroy
    edital = Edital.find(params[:id])
    edital.destroy
    redirect_to admin_editais_path, notice: 'Edital e as respetivas infrações foram removidos com sucesso.'
  end

  private

  def verificar_admin
    redirect_to root_path, alert: 'Acesso negado.' unless current_usuario&.admin?
  end
end
