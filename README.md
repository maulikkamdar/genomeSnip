GenomeSnip 
==========

GenomeSnip, a semantic visual analytics platform, was developed to facilitate cancer researchers to ‘snip’ the human genome informatively in fragments through interaction with an aggregative, circular visualization, the ‘Genomic Wheel’, and introspectively analyzing those fragments in a ‘Genomic Tracks’ display. It enables the intuitive exploration of the human genome and the interactive analysis of cancer datasets in conjunction with knowledge from Genome-wide Association Studies (GWAS) (oncogenes and somatic alterations) and about genes, which co-occur in pathways, diseases and publications. A prototype is deployed for the analysis of the methylation and exon expression datasets of Linked Cancer Genome Atlas Datasets (TCGA) for different tumors.

**Live Demo :** http://srvgal78.deri.ie/genomeSnip

**Conference Paper :** GenomeSnip: Fragmenting the Genomic Wheel to augment discovery in cancer research, 7th Conference on Semantics in Healthcare and Life Sciences (CSHALS), Boston, February 2014, available at http://aran.library.nuigalway.ie/xmlui/bitstream/handle/10379/4241/CSHALS_2014_camera_ready.pdf - Winner of the IO Informatics Best Paper Award

**Presentation :** http://maulik-kamdar.com/2014/02/genomesnip-cshals-presentation/

**System Requirements :**
* Apache 2 Server
* PHP5
* PHP-CURL (Check support by pointing the browser to /info.php)
* OpenRDF Sesame Triple Store

**Dependencies :**
* jQuery 1.7
* D3 JS (http://d3js.org/)
* Twitter Bootstrap
* Kinetic JS (http://kineticjs.com)

**TODO Technicalities:**
* Upload the Co-occurrence RDF Data Cubes to GIT (Please contact me for the same)
* The Exon Expression datasets are not visualized using this version
* The code is very messy !!



