export const sidebarTemplate = `
  <div id="cloud-cost-tracker-sidebar" class="cct-sidebar hidden">
    <div class="cct-sidebar-header">
      <h2>Cloud Cost Tracker</h2>
      <button id="cct-close-btn" class="cct-close-btn" aria-label="Close sidebar">×</button>
    </div>
    <div class="cct-sidebar-body">
      <div class="cct-field-group">
        <label for="cct-provider">Cloud Provider</label>
        <select id="cct-provider" class="cct-select">
          <option value="aws">AWS</option>
          <option value="gcp">GCP</option>
        </select>
      </div>
      <div class="cct-field-group">
        <label for="cct-service">Service</label>
        <select id="cct-service" class="cct-select">
          <option value="ec2">EC2</option>
          <option value="rds">RDS</option>
          <option value="lambda">Lambda</option>
          <option value="s3">S3</option>
        </select>
      </div>
          <div id="cct-service-forms">
            <div id="cct-ec2-fields" class="cct-service-form">
              <div class="cct-field-group" id="cct-os-group">
                <label for="cct-os">Operating System</label>
                <select id="cct-os" class="cct-select">
                  <option value="linux">Linux</option>
                  <option value="windows">Windows</option>
                  <option value="ubuntu-pro">Ubuntu Pro</option>
                  <option value="rhel">RHEL</option>
                  <option value="suse">SUSE</option>
                </select>
              </div>
              <div class="cct-field-group" id="cct-pricing-model-group">
                <label for="cct-pricing-model">Pricing Model</label>
                <select id="cct-pricing-model" class="cct-select">
                  <option value="on-demand">On Demand</option>
                  <option value="reserved">Reserved</option>
                  <option value="spot">Spot</option>
                  <option value="savings-plan">Savings Plan</option>
                </select>
              </div>
              <div class="cct-field-group" id="cct-instance-type-group">
                <label for="cct-instance-type">Instance Type</label>
                <select id="cct-instance-type" class="cct-select"></select>
              </div>
            </div>

            <div id="cct-rds-fields" class="cct-service-form hidden">
              <div class="cct-field-group">
                <label for="cct-rds-engine">Database Engine</label>
                <select id="cct-rds-engine" class="cct-select">
                  <option value="postgresql">PostgreSQL</option>
                  <option value="mysql">MySQL</option>
                  <option value="mariadb">MariaDB</option>
                  <option value="oracle">Oracle</option>
                  <option value="sqlserver">SQL Server</option>
                </select>
              </div>
              <div class="cct-field-group" id="cct-rds-pricing-model-group">
                <label for="cct-rds-pricing-model">Pricing Model</label>
                <select id="cct-rds-pricing-model" class="cct-select">
                  <option value="on-demand">On Demand</option>
                  <option value="reserved">Reserved</option>
                </select>
              </div>
              <div class="cct-field-group">
                <label for="cct-rds-instance">Instance Class</label>
                <select id="cct-rds-instance" class="cct-select"></select>
              </div>
              <div class="cct-field-group">
                <label for="cct-rds-storage">Storage (GB)</label>
                <input type="number" id="cct-rds-storage" min="1" value="20" />
              </div>
            </div>

            <div id="cct-lambda-fields" class="cct-service-form hidden">
              <div class="cct-field-group">
                <label for="cct-lambda-memory">Memory (MB)</label>
                <input type="number" id="cct-lambda-memory" min="128" step="64" value="128" />
              </div>
              <div class="cct-field-group">
                <label for="cct-lambda-requests">Requests / month</label>
                <input type="number" id="cct-lambda-requests" min="0" value="1000000" />
              </div>
              <div class="cct-field-group">
                <label for="cct-lambda-duration">Avg Duration (ms)</label>
                <input type="number" id="cct-lambda-duration" min="1" value="100" />
              </div>
            </div>

            <div id="cct-s3-fields" class="cct-service-form hidden">
              <div class="cct-field-group">
                <label for="cct-s3-storage">Storage (GB)</label>
                <input type="number" id="cct-s3-storage" min="0" value="100" />
              </div>
              <div class="cct-field-group">
                <label for="cct-s3-put">PUT Requests / month</label>
                <input type="number" id="cct-s3-put" min="0" value="1000" />
              </div>
              <div class="cct-field-group">
                <label for="cct-s3-get">GET Requests / month</label>
                <input type="number" id="cct-s3-get" min="0" value="1000" />
              </div>
              <div class="cct-field-group">
                <label for="cct-s3-tier">Storage Tier</label>
                <select id="cct-s3-tier" class="cct-select">
                  <option value="s3-standard">Standard</option>
                  <option value="s3-infrequent">Infrequent</option>
                </select>
              </div>
            </div>
          </div>
      <div class="cct-field-group">
        <label for="cct-region">Region</label>
        <select id="cct-region" class="cct-select">
          <option value="us-east-1">us-east-1</option>
          <option value="us-west-2">us-west-2</option>
          <option value="eu-west-1">eu-west-1</option>
          <option value="ap-south-1">ap-south-1</option>
          <option value="ap-southeast-1">ap-southeast-1</option>
          <option value="custom">Custom Region</option>
        </select>
      </div>
      <div class="cct-summary-card">
        <div class="cct-summary-row">
          <span>Hourly Cost</span>
          <strong id="cct-hourly-cost">$0.00</strong>
        </div>
        <div class="cct-summary-row">
          <span>Daily Cost</span>
          <strong id="cct-daily-cost">$0.00</strong>
        </div>
        <div class="cct-summary-row">
          <span>Monthly Cost</span>
          <strong id="cct-monthly-cost">$0.00</strong>
        </div>
        <div class="cct-summary-row">
          <span>Yearly Cost</span>
          <strong id="cct-yearly-cost">$0.00</strong>
        </div>
      </div>
      <div class="cct-breakdown-card">
        <h3>Cost Breakdown</h3>
        <div class="cct-summary-row">
          <span>Estimated Monthly Cost</span>
          <strong id="cct-est-monthly">$0.00</strong>
        </div>
        <div class="cct-summary-row">
          <span>Estimated Yearly Cost</span>
          <strong id="cct-est-yearly">$0.00</strong>
        </div>
        <div class="cct-summary-row">
          <span>Savings vs On-Demand</span>
          <strong id="cct-savings">$0.00 (0%)</strong>
        </div>
        <div class="cct-summary-row">
          <span id="cct-breakdown-label-1">Detail 1</span>
          <strong id="cct-breakdown-value-1">$0.00</strong>
        </div>
        <div class="cct-summary-row">
          <span id="cct-breakdown-label-2">Detail 2</span>
          <strong id="cct-breakdown-value-2">$0.00</strong>
        </div>
        <div class="cct-summary-row">
          <span id="cct-breakdown-label-3">Detail 3</span>
          <strong id="cct-breakdown-value-3">$0.00</strong>
        </div>
        <div class="cct-summary-row">
          <span id="cct-breakdown-label-4">Final Monthly Cost</span>
          <strong id="cct-breakdown-value-4">$0.00</strong>
        </div>
        <div class="cct-summary-row">
          <span id="cct-breakdown-label-5">Region</span>
          <strong id="cct-breakdown-value-5">us-east-1</strong>
        </div>
      </div>

      <div class="cct-compare-card hidden">
        <h3>Compare Instances</h3>
        <div class="cct-field-group">
          <label for="cct-compare-instance">Compare Instance Type</label>
          <select id="cct-compare-instance" class="cct-select"></select>
        </div>
        <div class="cct-summary-row">
          <span>Monthly Savings</span>
          <strong id="cct-compare-monthly">$0.00</strong>
        </div>
        <div class="cct-summary-row">
          <span>Yearly Savings</span>
          <strong id="cct-compare-yearly">$0.00</strong>
        </div>
      </div>
    </div>
  </div>
  <button id="cloud-cost-tracker-launcher" class="cct-launcher">Cloud Cost Tracker</button>
`;
