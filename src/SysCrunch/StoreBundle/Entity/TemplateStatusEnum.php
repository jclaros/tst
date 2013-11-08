<?php

namespace SysCrunch\StoreBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use FSC\HateoasBundle\Annotation as Rest;

/**
 * Class TemplateStatusEnum
 * @package SysCrunch\StoreBundle\Entity
 * @Rest\Relation("self", href = @Rest\Route("api_template_status_enum_get", parameters = { "id" = ".id" }))
 * @ORM\Table(name="template_status_enum")
 * @ORM\Entity(repositoryClass="SysCrunch\StoreBundle\Entity\Repository\TemplateStatusEnumRepository")
 */
class TemplateStatusEnum
{
  /**
   * @ORM\Column(type="string", length=250)
   */
  private $name;
  /**
   * @ORM\Column(type="integer")
   * @ORM\Id
   * @ORM\GeneratedValue
   */
  private $id;

  /**
   * @ORM\ManyToMany(targetEntity="Template")
   * @ORM\JoinTable(name="template_template_status_enum",
   *      joinColumns={@ORM\JoinColumn(name="template_id", referencedColumnName="id")},
   *      inverseJoinColumns={@ORM\JoinColumn(name="template_status_enum_id", referencedColumnName="id")}
   *      )
   */
  private $templates;

  /**
   * Constructor
   */
  public function __construct()
  {
    $this->template = new \Doctrine\Common\Collections\ArrayCollection();
  }


    /**
     * Set name
     *
     * @param string $name
     * @return TemplateStatusEnum
     */
    public function setName($name)
    {
        $this->name = $name;
    
        return $this;
    }

    /**
     * Get name
     *
     * @return string 
     */
    public function getName()
    {
        return $this->name;
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
     * Add templates
     *
     * @param \SysCrunch\StoreBundle\Entity\Template $templates
     * @return TemplateStatusEnum
     */
    public function addTemplate(\SysCrunch\StoreBundle\Entity\Template $templates)
    {
        $this->templates[] = $templates;
    
        return $this;
    }

    /**
     * Remove templates
     *
     * @param \SysCrunch\StoreBundle\Entity\Template $templates
     */
    public function removeTemplate(\SysCrunch\StoreBundle\Entity\Template $templates)
    {
        $this->templates->removeElement($templates);
    }

    /**
     * Get templates
     *
     * @return \Doctrine\Common\Collections\Collection 
     */
    public function getTemplates()
    {
        return $this->templates;
    }
}