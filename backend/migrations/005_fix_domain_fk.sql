ALTER TABLE links DROP CONSTRAINT IF EXISTS links_custom_domain_id_fkey;
ALTER TABLE links ADD CONSTRAINT links_custom_domain_id_fkey FOREIGN KEY (custom_domain_id) REFERENCES custom_domains(id) ON DELETE SET NULL;
