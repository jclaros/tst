<?php
  /**
   * theming-store-symfony
   * Owner: Jonathan Claros <jonathan.claros@syscrunch.com>
   * Date: 7/29/13
   * Time: 12:35 PM
   */

  namespace SysCrunch\StoreBundle\Entity;

  use Doctrine\Common\Collections\ArrayCollection;
  use Gedmo\Mapping\Annotation as Gedmo;
  use Doctrine\ORM\Mapping as ORM;
  use SysCrunch\Base\InitialBundle\Entity\User;

  use JMS\Serializer\Annotation as Serializer;
  use FSC\HateoasBundle\Annotation as Rest;


  /**
   * Class Template
   * @package SysCrunch\StoreBundle\Entity
   * @Rest\Relation("self", href = @Rest\Route("api_template_get", parameters = { "id" = ".id" }))
   * @Rest\Relation("templates", href = @Rest\Route("api_template_list"))
   * @Serializer\XmlRoot("template")
   * @ORM\Table(name="template")
   * @ORM\Entity(repositoryClass="SysCrunch\StoreBundle\Entity\Repository\TemplateRepository")
   */
  class Template
  {
    
    /**
     * @ORM\Column(type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue
     */
    private $id;
    /**
     * @ORM\Column(type="string", length=128)
     */
    private $title;
    /**
     * @ORM\Column(type="text", nullable=true)
     */
    private $description;
    /**
     * @Gedmo\Timestampable(on="create")
     * @ORM\Column(type="datetime")
     */
    private $created;
    /**
     * @Gedmo\Timestampable(on="update")
     * @ORM\Column(type="datetime", nullable=true)
     */
    private $updated;
    /**
     * @var datetime $contentChanged
     *
     * @ORM\Column(name="content_changed", type="datetime", nullable=true)
     * @Gedmo\Timestampable(on="change", field={"title", "description"})
     */
    private $contentChanged;
    /**
     * @var User $createdBy
     *
     * @Gedmo\Blameable(on="create")
     * @ORM\ManyToOne(targetEntity="SysCrunch\Base\InitialBundle\Entity\User")
     * @ORM\JoinColumn(name="created_by", referencedColumnName="id")
     */
    private $createdBy;

    /**
     * basic creator
     */
    public function __construct(){
      $this->created = new \DateTime();
    }

    public function getDynamicHref() {
      return "dynamic/Href/here";
    }

    /**
     * Get id
     *
     * @return integer
     */
    public function getId()
    {
      return $this->id;
    }
    
    /**
     * Set id
     *
     */
    public function setId($param)
    {
      $this->id = $param;
      return $this;
    }

    /**
     * Get title
     *
     * @return string
     */
    public function getTitle()
    {
      return $this->title;
    }

    /**
     * Set title
     *
     * @param string $title
     * @return Template
     */
    public function setTitle($title)
    {
      $this->title = $title;

      return $this;
    }

    /**
     * Get description
     *
     * @return string
     */
    public function getDescription()
    {
      return $this->description;
    }

    /**
     * Set description
     *
     * @param string $description
     * @return Template
     */
    public function setDescription($description)
    {
      $this->description = $description;

      return $this;
    }

    /**
     * Get created
     *
     * @return \DateTime
     */
    public function getCreated()
    {
      return $this->created;
    }

    /**
     * Set created
     *
     * @param \DateTime $created
     * @return Template
     */
    public function setCreated($created)
    {
      $this->created = $created;

      return $this;
    }

    /**
     * Get updated
     *
     * @return \DateTime
     */
    public function getUpdated()
    {
      return $this->updated;
    }

    /**
     * Set updated
     *
     * @param \DateTime $updated
     * @return Template
     */
    public function setUpdated($updated)
    {
      $this->updated = $updated;

      return $this;
    }

    /**
     * Get contentChanged
     *
     * @return \DateTime
     */
    public function getContentChanged()
    {
      return $this->contentChanged;
    }

    /**
     * Set contentChanged
     *
     * @param \DateTime $contentChanged
     * @return Template
     */
    public function setContentChanged($contentChanged)
    {
      $this->contentChanged = $contentChanged;

      return $this;
    }

    /**
     * Get createdBy
     *
     * @return \SysCrunch\Base\InitialBundle\Entity\User
     */
    public function getCreatedBy()
    {
      return $this->createdBy;
    }

    /**
     * Set createdBy
     *
     * @param \SysCrunch\Base\InitialBundle\Entity\User $createdBy
     * @return Template
     */
    public function setCreatedBy(\SysCrunch\Base\InitialBundle\Entity\User $createdBy = null)
    {
      $this->createdBy = $createdBy;

      return $this;
    }
  }