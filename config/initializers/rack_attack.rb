class Rack::Attack
  ### Cache store ###
  # Throttle 用のキャッシュ。Rails.cache を使うのが便利
  # Rack::Attack.cache.store = ActiveSupport::Cache::MemoryStore.new

  # 同じIPからの短時間アクセスを制限
  throttle("req/ip", limit: 300, period: 5.minutes) do |req|
    req.ip
  end

  # PDFアップロード制限
  throttle("uploads/ip", limit: 20, period: 1.minute) do |req|
    if req.post? && req.path.match?(/^\/documents\/[^\/]+$/)
      req.ip
    end
  end

  # カスタムレスポンス
  # 制限に達した場合のレスポンス
  self.throttled_response = lambda do |env|
    [
      429,
      { "Content-Type" => "text/plain" },
      [ "アクセスが多すぎます。しばらく待ってください。" ]
    ]
  end
end
