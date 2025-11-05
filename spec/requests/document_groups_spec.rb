require 'rails_helper'

RSpec.describe "DocumentGroups", type: :request do
  describe "GET /new" do
    it "returns http success" do
      get "/document_groups/new"
      expect(response).to have_http_status(:success)
    end
  end

  describe "GET /create" do
    it "returns http success" do
      get "/document_groups/create"
      expect(response).to have_http_status(:success)
    end
  end
end
