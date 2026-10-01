require "test_helper"

class ConsultasControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get consultas_index_url
    assert_response :success
  end
end
